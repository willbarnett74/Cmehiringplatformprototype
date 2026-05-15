/**
 * Format C — Ranked Preference
 * Drag-to-rank using @dnd-kit/core + @dnd-kit/sortable.
 * Shuffles items on mount unless `initialOrderedIds` restores a saved order.
 * Calls onChange on reorder and once on mount so parents can gate Continue without requiring a drag first.
 * Scoring: 1st = 5, 2nd = 3, 3rd = 2, 4th = 1.
 */

import { useState, useLayoutEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface RankItem {
  id: string;
  label: string;
  description: string;
}

export const RANK_SCORES = [5, 3, 2, 1] as const;

function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function orderItemsFromIds(items: RankItem[], ids: string[]): RankItem[] | null {
  if (ids.length !== items.length) return null;
  const map = new Map(items.map((i) => [i.id, i]));
  const ordered = ids.map((id) => map.get(id)).filter((x): x is RankItem => x != null);
  return ordered.length === items.length ? ordered : null;
}

interface SortableItemProps {
  item: RankItem;
  index: number;
}

function SortableItem({ item, index }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderRadius: '12px' }}
      className="flex items-start gap-4 p-5 border-2 border-black/[0.08] bg-white cursor-move hover:border-[#7DBBFF]/40 transition-all"
      {...attributes}
      {...listeners}
    >
      <div
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#7DBBFF] text-white font-semibold text-sm"
        style={{ borderRadius: '6px' }}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-[#111827] mb-1">{item.label}</div>
        <div className="text-sm text-[#6B7280] leading-relaxed">{item.description}</div>
      </div>
      <div className="flex-shrink-0 text-[#9CA3AF]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="6" r="1.5" fill="currentColor" />
          <circle cx="13" cy="6" r="1.5" fill="currentColor" />
          <circle cx="7" cy="10" r="1.5" fill="currentColor" />
          <circle cx="13" cy="10" r="1.5" fill="currentColor" />
          <circle cx="7" cy="14" r="1.5" fill="currentColor" />
          <circle cx="13" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

interface RankedPreferenceProps {
  items: RankItem[];
  onChange: (orderedIds: string[], scores: Record<string, number>) => void;
  /** When revisiting a step, restore list order from saved `ordered_ids` (must match `items` ids). */
  initialOrderedIds?: string[] | null;
  readOnly?: boolean;
}

export function RankedPreference({ items, onChange, initialOrderedIds, readOnly = false }: RankedPreferenceProps) {
  const [ordered, setOrdered] = useState<RankItem[]>(() => {
    const fromSaved =
      initialOrderedIds && initialOrderedIds.length > 0
        ? orderItemsFromIds(items, initialOrderedIds)
        : null;
    return fromSaved ?? shuffleArray(items);
  });

  const sensors = useSensors(useSensor(PointerSensor));

  // Default shuffled order never called onChange, so section gating stayed false until the first drag.
  // Also syncs restored order back to parent on mount.
  useLayoutEffect(() => {
    const orderedIds = ordered.map((i) => i.id);
    const scores: Record<string, number> = {};
    ordered.forEach((item, idx) => {
      scores[item.id] = RANK_SCORES[idx] ?? 1;
    });
    onChange(orderedIds, scores);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time sync for current ordered list on mount
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = ordered.findIndex((i) => i.id === active.id);
    const newIndex = ordered.findIndex((i) => i.id === over.id);
    const newOrdered = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(newOrdered);

    const orderedIds = newOrdered.map((i) => i.id);
    const scores: Record<string, number> = {};
    newOrdered.forEach((item, idx) => {
      scores[item.id] = RANK_SCORES[idx] ?? 1;
    });
    onChange(orderedIds, scores);
  };

  return (
    <div className={readOnly ? 'pointer-events-none cursor-not-allowed opacity-60' : undefined}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ordered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {ordered.map((item, index) => (
              <SortableItem key={item.id} item={item} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
