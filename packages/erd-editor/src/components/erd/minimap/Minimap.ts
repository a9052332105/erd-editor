import { createRef, FC, html, ref, repeat } from '@dineug/r-html';

import { useAppContext } from '@/components/context';
import * as CanvasStyle from '@/components/erd/canvas/Canvas.styles';
import Memo from '@/components/erd/minimap/memo/Memo';
import Table from '@/components/erd/minimap/table/Table';
import Viewport from '@/components/erd/minimap/viewport/Viewport';
import { MINIMAP_MARGIN, MINIMAP_SIZE } from '@/constants/layout';
import { scrollToAction } from '@/engine/modules/settings/atom.actions';
import { query } from '@/utils/collection/query';
import { isMouseEvent } from '@/utils/domEvent';

import * as styles from './Minimap.styles';

const BORDER = 1;

export type MinimapProps = {};

const Minimap: FC<MinimapProps> = (props, ctx) => {
  const app = useAppContext(ctx);
  const minimap = createRef<HTMLDivElement>();

  const getRatio = () => {
    const { store } = app.value;
    const {
      settings: { width },
    } = store.state;
    return MINIMAP_SIZE / width;
  };

  const styleMap = () => {
    const { store } = app.value;
    const {
      settings: { width, height },
    } = store.state;
    const ratio = getRatio();
    const x = (-1 * width) / 2 + (width * ratio) / 2;
    const y = (-1 * height) / 2 + (height * ratio) / 2;
    const right = x + MINIMAP_MARGIN;
    const top = y + MINIMAP_MARGIN;

    return {
      transform: `scale(${ratio}, ${ratio})`,
      width: `${width}px`,
      height: `${height}px`,
      right: `${right}px`,
      top: `${top}px`,
    };
  };

  const borderStyleMap = () => {
    const margin = MINIMAP_MARGIN - BORDER;
    return {
      width: `${MINIMAP_SIZE}px`,
      height: `${MINIMAP_SIZE}px`,
      right: `${margin}px`,
      top: `${margin}px`,
    };
  };

  const handleMove = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
    const { store } = app.value;
    const {
      editor: { viewport },
    } = store.state;
    const ratio = getRatio();
    const $minimap = minimap.value;
    const rect = $minimap.getBoundingClientRect();
    const clientX = isMouseEvent(event)
      ? event.clientX
      : event.touches[0].clientX;
    const clientY = isMouseEvent(event)
      ? event.clientY
      : event.touches[0].clientY;

    const x = clientX - rect.x;
    const y = clientY - rect.y;
    const absoluteX = x / ratio;
    const absoluteY = y / ratio;
    const scrollLeft = absoluteX - viewport.width / 2;
    const scrollTop = absoluteY - viewport.height / 2;

    store.dispatch(
      scrollToAction({
        scrollLeft: -1 * scrollLeft,
        scrollTop: -1 * scrollTop,
      })
    );
  };

  return () => {
    const { store } = app.value;
    const {
      settings: { width, height, zoomLevel, show },
      doc: { tableIds, memoIds },
      collections,
    } = store.state;

    const tables = query(collections)
      .collection('tableEntities')
      .selectByIds(tableIds);

    const memos = query(collections)
      .collection('memoEntities')
      .selectByIds(memoIds);

    return html`
      <div
        class=${styles.minimap}
        style=${styleMap()}
        ${ref(minimap)}
        @mousedown=${handleMove}
        @touchstart=${handleMove}
      >
        <div
          class=${CanvasStyle.root}
          style=${{
            width: `${width}px`,
            height: `${height}px`,
            'min-width': `${width}px`,
            'min-height': `${height}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          ${repeat(
            tables,
            table => table.id,
            table => html`<${Table} table=${table} />`
          )}
          ${repeat(
            memos,
            memo => memo.id,
            memo => html`<${Memo} memo=${memo} />`
          )}
        </div>
      </div>
      <div class=${styles.border} style=${borderStyleMap()}></div>
      <${Viewport} />
    `;
  };
};

export default Minimap;
