import { useId } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Stop } from "../types";

interface SortableStopRowProps {
  stop: Stop;
  index: number;
  onRemove: (id: string) => void;
}

function SortableStopRow({ stop, index, onRemove }: SortableStopRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
    border: "0.5px solid var(--rf-border)",
    padding: "8px 10px",
    borderRadius: "8px",
    marginBottom: "5px",
    backgroundColor: "white",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: "grab", color: "var(--rf-muted)" }}
        className="flex items-center justify-center p-1 hover:text-orange-600 transition-colors"
      >
        <GripVertical size={14} />
      </div>

      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          backgroundColor: stop.isDepot ? "var(--rf-dark)" : "var(--rf-primary)",
          fontSize: "9px",
          fontWeight: 600,
        }}
        className="flex items-center justify-center text-white flex-shrink-0"
      >
        {stop.isDepot ? "D" : index}
      </div>

      <div className="flex-1 min-w-0">
        <h4
          style={{ fontSize: "12px", fontWeight: 500, color: "var(--rf-dark)" }}
          className="truncate m-0"
        >
          {stop.name}
        </h4>
        <p
          style={{ fontSize: "10px", color: "var(--rf-muted)" }}
          className="truncate m-0"
        >
          {stop.address}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          style={{
            fontSize: "10px",
            backgroundColor: "var(--rf-surface)",
            color: "var(--rf-muted)",
            padding: "2px 7px",
            borderRadius: "99px",
          }}
          className="font-medium whitespace-nowrap"
        >
          {stop.eta || "—"}
        </span>

        <button
          onClick={() => onRemove(stop.id)}
          style={{ color: "var(--rf-danger)" }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-orange-50 rounded transition-all cursor-pointer"
          title="Remove stop"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

interface StopListProps {
  stops: Stop[];
  onReorder: (stops: Stop[]) => void;
  onRemoveStop: (id: string) => void;
  onAddStop: () => void;
}

export function StopList({ stops, onReorder, onRemoveStop, onAddStop }: StopListProps) {
  const dndContextId = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require moving 8px before drag starts to allow clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = stops.findIndex((stop) => stop.id === active.id);
      const newIndex = stops.findIndex((stop) => stop.id === over.id);
      
      const newStops = arrayMove(stops, oldIndex, newIndex);
      onReorder(newStops);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--rf-muted)",
          }}
        >
          Stop order
        </span>
        <span
          style={{
            fontSize: "10px",
            backgroundColor: "var(--rf-surface)",
            color: "var(--rf-muted)",
            padding: "1px 6px",
            borderRadius: "99px",
          }}
          className="font-semibold"
        >
          {stops.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
        <DndContext
          id={dndContextId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={stops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {stops.map((stop, index) => (
              <SortableStopRow
                key={stop.id}
                stop={stop}
                index={index}
                onRemove={onRemoveStop}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <button
        onClick={onAddStop}
        style={{
          border: "1.5px dashed var(--rf-border)",
          borderRadius: "8px",
          padding: "8px",
          fontSize: "12px",
          color: "var(--rf-muted)",
          backgroundColor: "transparent",
          cursor: "pointer",
        }}
        className="mt-3 flex w-full items-center justify-center gap-1.5 transition-colors hover:bg-[var(--rf-surface)]"
      >
        <Plus size={14} />
        Add stop
      </button>
    </div>
  );
}
