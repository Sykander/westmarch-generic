import type { ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export type CollectionEditorProps<T> = {
  title: string;
  items: T[];
  emptyText: string;
  addLabel?: string;
  addItem?: () => T;
  onChange: (items: T[]) => void;
  getKey: (item: T, index: number) => string;
  renderSummary?: (item: T, index: number) => ReactNode;
  renderItem: (props: {
    item: T;
    index: number;
    updateItem: (nextItem: T) => void;
    removeItem: () => void;
  }) => ReactNode;
};

export function CollectionEditor<T>({
  title,
  items,
  emptyText,
  addLabel,
  addItem,
  onChange,
  getKey,
  renderSummary,
  renderItem,
}: CollectionEditorProps<T>) {
  function updateItem(index: number, nextItem: T) {
    onChange(items.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  }

  function removeItem(index: number) {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section className="collection-editor" aria-label={title}>
      <div className="collection-editor-head">
        <h3>{title}</h3>
        {addItem && addLabel ? (
          <button type="button" onClick={() => onChange([...items, addItem()])}>
            <Plus size={16} aria-hidden="true" />
            {addLabel}
          </button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="collection-empty">{emptyText}</p>
      ) : (
        <div className="collection-list">
          {items.map((item, index) => (
            <article className="collection-item" key={getKey(item, index)}>
              <header className="collection-item-head">
                <div>
                  <strong>#{index + 1}</strong>
                  {renderSummary ? <span>{renderSummary(item, index)}</span> : null}
                </div>
                <button
                  type="button"
                  className="field-action-button"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${title} row ${index + 1}`}
                  title="Remove row"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </header>
              {renderItem({
                item,
                index,
                updateItem: (nextItem) => updateItem(index, nextItem),
                removeItem: () => removeItem(index),
              })}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
