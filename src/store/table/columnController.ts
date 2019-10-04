import {State, Table, Column, ColumnTable} from '../table';
import {Commit as RelationshipCommit} from '@/store/relationship';
import {log, getData} from '@/ts/util';
import ColumnModel from '@/models/ColumnModel';
import {FocusType} from '@/models/TableFocusModel';
import {tableFocusStart} from './tableController';
import StoreManagement from '@/store/StoreManagement';
import {relationshipSort} from '@/store/relationship/relationshipHelper';

export function columnAdd(state: State, payload: { table: Table, store: StoreManagement }) {
  log.debug('columnController columnAdd');
  const {table, store} = payload;
  table.columns.push(new ColumnModel(store));
  relationshipSort(state.tables, store.relationshipStore.state.relationships);
}

export function columnAddAll(state: State, store: StoreManagement) {
  log.debug('columnController columnAddAll');
  state.tables.forEach((table: Table) => {
    if (table.ui.active) {
      if (!state.tableFocus) {
        tableFocusStart(state, {table, store});
      }
      table.columns.push(new ColumnModel(store));
    }
  });
  relationshipSort(state.tables, store.relationshipStore.state.relationships);
}

export function columnFocus(state: State, payload: { focusType: FocusType, column: Column, event: MouseEvent }) {
  log.debug('columnController columnFocus');
  const {focusType, column, event} = payload;
  if (state.tableFocus) {
    state.tableFocus.focus(focusType, column);
    state.tableFocus.selected(event);
  }
}

export function columnRemove(state: State, payload: { table: Table, column: Column, store: StoreManagement }) {
  log.debug('columnController columnRemove');
  const {table, column, store} = payload;
  const index = table.columns.indexOf(column);
  table.columns.splice(index, 1);
  store.relationshipStore.commit(RelationshipCommit.relationshipRemoveColumn, {
    table,
    column,
    store,
  });
  relationshipSort(state.tables, store.relationshipStore.state.relationships);
}

export function columnRemoveAll(state: State, store: StoreManagement) {
  log.debug('columnController columnRemoveAll');
  if (state.tableFocus) {
    const columns = state.tableFocus.columnSelectAll();
    columns.forEach((column) => {
      columnRemove(state, {
        table: state.tableFocus as Table,
        column,
        store,
      });
    });
  }
}

export function columnPrimaryKey(state: State) {
  log.debug('columnController columnPrimaryKey');
  if (state.tableFocus) {
    state.tableFocus.primaryKey();
  }
}

export function columnCopy(state: State) {
  log.debug('columnController columnCopy');
  if (state.tableFocus) {
    state.copyColumns = state.tableFocus.columnSelectAll();
  } else {
    state.copyColumns = [];
  }
}

export function columnPaste(state: State, store: StoreManagement) {
  log.debug('columnController columnPaste');
  if (state.copyColumns.length !== 0) {
    state.tables.forEach((table) => {
      if (table.ui.active) {
        state.copyColumns.forEach((column) => {
          table.columns.push(new ColumnModel(store, {
            copy: {
              table,
              column,
            },
          }));
        });
      }
    });
  }
}

export function columnDraggableStart(state: State, columnDraggable: ColumnTable) {
  log.debug('columnController columnDraggableStart');
  state.columnDraggable = columnDraggable;
}

export function columnDraggableEnd(state: State) {
  log.debug('columnController columnDraggableEnd');
  state.columnDraggable = null;
}

export function columnMove(state: State, payload: { table: Table, column: Column, store: StoreManagement }) {
  log.debug('columnController columnMove');
  if (state.columnDraggable) {
    const {table, column, store} = payload;
    const current = state.columnDraggable;
    if (table.id === current.table.id && column.id !== current.column.id) {
      const currentIndex = table.columns.indexOf(current.column);
      const targetIndex = table.columns.indexOf(column);
      table.columns.splice(currentIndex, 1);
      table.columns.splice(targetIndex, 0, current.column);
    } else if (table.id !== current.table.id && column.id !== current.column.id) {
      const currentIndex = current.table.columns.indexOf(current.column);
      const targetIndex = table.columns.indexOf(column);
      current.table.columns.splice(currentIndex, 1);
      table.columns.splice(targetIndex, 0, current.column);
      store.relationshipStore.commit(RelationshipCommit.relationshipRemoveColumn, {
        table: current.table,
        column: current.column,
        store,
      });
    }
    state.columnDraggable.table = table;
  }
}

export function columnActive(state: State, payload: {tableId: string, columnIds: string[]}) {
  log.debug('columnController columnActive');
  const {tableId, columnIds} = payload;
  const table = getData(state.tables, tableId);
  if (table) {
    table.columns.forEach((column) => {
      column.ui.active = columnIds.indexOf(column.id) !== -1;
    });
  }
}

export function columnActiveEnd(state: State, tableId: string) {
  log.debug('columnController columnActiveEnd');
  const table = getData(state.tables, tableId);
  if (table) {
    table.columns.forEach((column) => column.ui.active = false);
  }
}
