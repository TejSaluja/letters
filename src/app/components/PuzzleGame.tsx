import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Heart, RotateCcw, X } from 'lucide-react';

const IMAGE_SOURCE = '/assets/puzzle-image.png';
const GRID_SIZE = 8;
const PIECE_COUNT = GRID_SIZE * GRID_SIZE;

interface PuzzlePiece {
  id: number;
  row: number;
  column: number;
}

interface DragState {
  pieceId: number;
  x: number;
  y: number;
  from: 'tray' | 'board';
}

interface BoardPosition {
  row: number;
  column: number;
}

interface PuzzleGameProps {
  onClose: () => void;
}

function shufflePieces(): PuzzlePiece[] {
  const pieces = Array.from({ length: PIECE_COUNT }, (_, id) => ({
    id,
    row: Math.floor(id / GRID_SIZE),
    column: id % GRID_SIZE,
  }));

  for (let index = pieces.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pieces[index], pieces[swapIndex]] = [pieces[swapIndex], pieces[index]];
  }

  return pieces;
}

function seamSign(first: number, second: number): 1 | -1 {
  return (first * 17 + second * 31) % 2 === 0 ? 1 : -1;
}

function piecePath(piece: PuzzlePiece): string {
  const top = piece.row === 0 ? 0 : seamSign(piece.column, piece.row - 1);
  const right = piece.column === GRID_SIZE - 1 ? 0 : seamSign(piece.row, piece.column);
  const bottom = piece.row === GRID_SIZE - 1 ? 0 : -seamSign(piece.column, piece.row);
  const left = piece.column === 0 ? 0 : -seamSign(piece.row, piece.column - 1);

  const topEdge = top === 0 ? 'H 100' : `H 40 C 40 ${top * -14}, 60 ${top * -14}, 60 0 H 100`;
  const rightEdge = right === 0 ? 'V 100' : `V 40 C ${100 + right * 14} 40, ${100 + right * 14} 60, 100 60 V 100`;
  const bottomEdge = bottom === 0 ? 'H 0' : `H 60 C 60 ${100 + bottom * 14}, 40 ${100 + bottom * 14}, 40 100 H 0`;
  const leftEdge = left === 0 ? 'V 0' : `V 60 C ${left * -14} 60, ${left * -14} 40, 0 40 V 0`;

  return `M 0 0 ${topEdge} ${rightEdge} ${bottomEdge} ${leftEdge} Z`;
}

function PuzzlePieceGraphic({
  piece,
  onError,
  compact = false,
  showBorder = true,
}: {
  piece: PuzzlePiece;
  onError: () => void;
  compact?: boolean;
  showBorder?: boolean;
}) {
  const clipId = `puzzle-piece-clip-${piece.id}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      overflow="visible"
      className={`absolute overflow-visible ${compact ? 'inset-[18%] h-[72%] w-[72%]' : 'inset-0 h-full w-full'}`}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={piecePath(piece)} />
        </clipPath>
      </defs>
      <image
        href={IMAGE_SOURCE}
        x={-piece.column * 100}
        y={-piece.row * 100}
        width={GRID_SIZE * 100}
        height={GRID_SIZE * 100}
        preserveAspectRatio="none"
        clipPath={`url(#${clipId})`}
        onError={onError}
      />
      {showBorder && (
        <path
          d={piecePath(piece)}
          fill="none"
          stroke="rgba(136, 19, 55, 0.34)"
          strokeWidth="1.4"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}

function hasMatchingNeighbor(
  piece: PuzzlePiece,
  position: BoardPosition,
  boardPositions: Map<number, BoardPosition>,
  pieces: PuzzlePiece[],
): boolean {
  const neighboringPiece = (row: number, column: number) =>
    pieces.find((candidate) => {
      const candidatePosition = boardPositions.get(candidate.id);
      return candidatePosition?.row === row && candidatePosition.column === column;
    });
  const top = neighboringPiece(position.row - 1, position.column);
  const bottom = neighboringPiece(position.row + 1, position.column);
  const left = neighboringPiece(position.row, position.column - 1);
  const right = neighboringPiece(position.row, position.column + 1);

  return (
    top?.row === piece.row - 1
    && top.column === piece.column
  ) || (
    bottom?.row === piece.row + 1
    && bottom.column === piece.column
  ) || (
    left?.row === piece.row
    && left.column === piece.column - 1
  ) || (
    right?.row === piece.row
    && right.column === piece.column + 1
  );
}

export function PuzzleGame({ onClose }: PuzzleGameProps) {
  const [pieces, setPieces] = useState<PuzzlePiece[]>(shufflePieces);
  const [boardPositions, setBoardPositions] = useState<Map<number, BoardPosition>>(() => new Map());
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const trayRef = useRef<HTMLDivElement>(null);

  const remainingPieces = useMemo(
    () => pieces.filter((piece) => !boardPositions.has(piece.id)),
    [pieces, boardPositions],
  );
  const isComplete = pieces.every((piece) => {
    const position = boardPositions.get(piece.id);
    return position?.row === piece.row && position.column === piece.column;
  });

  const restart = useCallback(() => {
    setPieces(shufflePieces());
    setBoardPositions(new Map());
    setDragState(null);
  }, []);

  const revealHint = () => {
    if (remainingPieces.length === 0) {
      return;
    }

    const piece = remainingPieces[Math.floor(Math.random() * remainingPieces.length)];
    setBoardPositions((current) => {
      const next = new Map(current);
      const displacedPiece = pieces.find((candidate) => {
        const position = current.get(candidate.id);
        return position?.row === piece.row && position.column === piece.column;
      });

      if (displacedPiece) {
        next.delete(displacedPiece.id);
      }

      next.set(piece.id, { row: piece.row, column: piece.column });
      return next;
    });
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setDragState((current) => current ? { ...current, x: event.clientX, y: event.clientY } : current);
    };

    const handlePointerUp = (event: PointerEvent) => {
      const board = boardRef.current;
      const tray = trayRef.current;
      const piece = pieces.find((candidate) => candidate.id === dragState.pieceId);

      if (board && piece) {
        const bounds = board.getBoundingClientRect();
        const isInsideBoard = event.clientX >= bounds.left
          && event.clientX <= bounds.right
          && event.clientY >= bounds.top
          && event.clientY <= bounds.bottom;
        const trayBounds = tray?.getBoundingClientRect();
        const isInsideTray = trayBounds !== undefined
          && event.clientX >= trayBounds.left
          && event.clientX <= trayBounds.right
          && event.clientY >= trayBounds.top
          && event.clientY <= trayBounds.bottom;

        if (isInsideTray) {
          setBoardPositions((current) => {
            const next = new Map(current);
            next.delete(dragState.pieceId);
            return next;
          });
          setDragState(null);
          return;
        }

        if (!isInsideBoard) {
          setDragState(null);
          return;
        }

        const column = Math.floor(((event.clientX - bounds.left) / bounds.width) * GRID_SIZE);
        const row = Math.floor(((event.clientY - bounds.top) / bounds.height) * GRID_SIZE);

        setBoardPositions((current) => {
          const next = new Map(current);
          const occupyingPiece = [...next.entries()].find(
            ([id, position]) => id !== piece.id && position.row === row && position.column === column,
          )?.[0];

          if (occupyingPiece !== undefined && dragState.from === 'board') {
            const previousPosition = next.get(piece.id);
            if (previousPosition) {
              next.set(occupyingPiece, previousPosition);
            }
          } else if (occupyingPiece !== undefined) {
            return current;
          }

          next.set(piece.id, { row, column });
          return next;
        });
      } else {
        setBoardPositions((current) => {
          const next = new Map(current);
          next.delete(dragState.pieceId);
          return next;
        });
      }

      if (!board || !piece) {
        setDragState(null);
        return;
      }

      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, pieces]);

  const handlePointerDown = (event: React.PointerEvent, pieceId: number, from: 'tray' | 'board') => {
    event.preventDefault();
    setDragState({ pieceId, x: event.clientX, y: event.clientY, from });
  };

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-rose-950/60 p-4 backdrop-blur-sm md:p-8">
      <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 p-5 shadow-2xl md:p-8">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-rose-700">
              <button
                onClick={revealHint}
                className="rounded-full text-rose-500 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-rose-300"
                title="A little hint"
                aria-label="Reveal a random puzzle piece"
              >
                <Heart className="h-5 w-5 fill-current" />
              </button>
              <span className="text-sm font-medium uppercase tracking-[0.2em]">A little secret</span>
            </div>
            <h2 className="text-3xl text-rose-950 md:text-4xl">Piece together the memories</h2>
            <p className="mt-2 text-rose-700">
              Drag pieces onto the board. ENJOYY PINDIII!!!
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              onClick={restart}
              className="rounded-xl border border-rose-300 bg-white/70 p-3 text-rose-700 transition-colors hover:bg-white"
              title="Restart puzzle"
              aria-label="Restart puzzle"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-rose-300 bg-white/70 p-3 text-rose-700 transition-colors hover:bg-white"
              title="Close puzzle"
              aria-label="Close puzzle"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div
          className={`grid min-h-0 flex-1 gap-4 transition-all duration-700 ease-out ${
            isComplete ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.4fr)]'
          }`}
        >
          <div
            ref={boardRef}
            className={`relative aspect-[8/5] min-h-0 w-full self-center overflow-hidden rounded-2xl border-4 border-dashed border-rose-300 bg-rose-50 shadow-inner transition-all duration-700 ease-out ${
              isComplete ? 'max-h-[calc(100vh-14rem)] scale-[1.01]' : ''
            }`}
            aria-label="Puzzle board"
          >
            {isComplete ? (
              <img
                src={IMAGE_SOURCE}
                alt="Completed puzzle"
                className="absolute inset-0 h-full w-full object-contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              pieces.map((piece) => {
                const position = boardPositions.get(piece.id);
                if (!position) {
                  return null;
                }

                return (
                  <div
                    key={piece.id}
                    onPointerDown={(event) => handlePointerDown(event, piece.id, 'board')}
                    className="absolute z-10 h-[12.5%] w-[12.5%] cursor-grab touch-none transition-all active:cursor-grabbing"
                    style={{ left: `${position.column * 12.5}%`, top: `${position.row * 12.5}%` }}
                  >
                    <PuzzlePieceGraphic
                      piece={piece}
                      onError={() => setImageFailed(true)}
                      showBorder={!hasMatchingNeighbor(piece, position, boardPositions, pieces)}
                    />
                  </div>
                );
              })
            )}
            {imageFailed && (
              <div className="absolute inset-0 flex items-center justify-center bg-rose-50/95 p-6 text-center text-rose-800">
                Add your image as <code className="mx-1 rounded bg-rose-100 px-1">public/assets/puzzle-image.png</code> to start playing.
              </div>
            )}
          </div>

          {!isComplete && (
            <div
              ref={trayRef}
              className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-rose-200 bg-rose-50/80 p-3 opacity-100 transition-all duration-700 ease-out"
            >
              <div className="mb-3 flex items-center justify-between text-sm text-rose-700">
                <span>Pieces to place</span>
                <span>{remainingPieces.length} / {PIECE_COUNT}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                <div className="grid grid-cols-3 gap-4">
                  {remainingPieces.map((piece) => (
                    <button
                      key={piece.id}
                      onPointerDown={(event) => handlePointerDown(event, piece.id, 'tray')}
                      className="relative aspect-square cursor-grab touch-none overflow-visible bg-transparent active:cursor-grabbing"
                      aria-label={`Puzzle piece ${piece.id + 1}`}
                    >
                      <PuzzlePieceGraphic
                        piece={piece}
                        onError={() => setImageFailed(true)}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {dragState && (
        <div
          className="pointer-events-none fixed z-40 h-16 w-16"
          style={{
            left: dragState.x - 32,
            top: dragState.y - 32,
          }}
        >
          <PuzzlePieceGraphic
            piece={pieces.find((piece) => piece.id === dragState.pieceId)!}
            onError={() => setImageFailed(true)}
          />
        </div>
      )}
    </div>
  );
}
