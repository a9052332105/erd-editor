import { takeEvery } from '@dineug/go';
import { arrayHas } from '@dineug/shared';

import { ColumnOption, StartRelationshipType } from '@/constants/schema';
import type { CO, Hook } from '@/engine/hooks';
import { moveMemoAction } from '@/engine/modules/memo/atom.actions';
import { addRelationshipAction } from '@/engine/modules/relationship/atom.actions';
import { changeShowAction } from '@/engine/modules/settings/atom.actions';
import {
  changeTableCommentAction,
  changeTableNameAction,
  moveTableAction,
} from '@/engine/modules/table/atom.actions';
import {
  addColumnAction,
  changeColumnCommentAction,
  changeColumnDataTypeAction,
  changeColumnDefaultAction,
  changeColumnNameAction,
  changeColumnNotNullAction,
  changeColumnPrimaryKeyAction,
  removeColumnAction,
} from '@/engine/modules/tableColumn/atom.actions';
import { query } from '@/utils/collection/query';
import { relationshipSort } from '@/utils/draw-relationship/sort';

const identificationHook: CO = function* (channel, { doc, collections }) {
  yield takeEvery(channel, function* () {
    const collection = query(collections).collection('relationshipEntities');
    const relationships = collection.selectByIds(doc.relationshipIds);

    for (const { id, end, identification } of relationships) {
      const table = query(collections)
        .collection('tableEntities')
        .selectById(end.tableId);
      if (!table) continue;

      const has = arrayHas(table.columnIds);
      const columns = query(collections)
        .collection('tableColumnEntities')
        .selectByIds(end.columnIds)
        .filter(column => has(column.id));
      if (!columns.length) continue;

      const value = columns.every(
        column => column.options & ColumnOption.primaryKey
      );

      if (value === identification) {
        continue;
      }

      collection.updateOne(id, relationship => {
        relationship.identification = value;
      });
    }
  });
};

const startRelationshipHook: CO = function* (channel, { doc, collections }) {
  yield takeEvery(channel, function* () {
    const collection = query(collections).collection('relationshipEntities');
    const relationships = collection.selectByIds(doc.relationshipIds);

    for (const { id, end, startRelationshipType } of relationships) {
      const table = query(collections)
        .collection('tableEntities')
        .selectById(end.tableId);
      if (!table) continue;

      const has = arrayHas(table.columnIds);
      const columns = query(collections)
        .collection('tableColumnEntities')
        .selectByIds(end.columnIds)
        .filter(column => has(column.id));
      if (!columns.length) continue;

      const value = columns.every(
        column => column.options & ColumnOption.notNull
      )
        ? StartRelationshipType.dash
        : StartRelationshipType.ring;

      if (value === startRelationshipType) {
        continue;
      }

      collection.updateOne(id, relationship => {
        relationship.startRelationshipType = value;
      });
    }
  });
};

const relationshipSortHook: CO = function* (channel, state) {
  yield takeEvery(channel, function* () {
    relationshipSort(state);
  });
};

export const hooks: Hook[] = [
  [[removeColumnAction, changeColumnPrimaryKeyAction], identificationHook],
  [[removeColumnAction, changeColumnNotNullAction], startRelationshipHook],
  [
    [
      changeShowAction,
      addRelationshipAction,
      moveMemoAction,
      moveTableAction,
      changeTableNameAction,
      changeTableCommentAction,
      addColumnAction,
      removeColumnAction,
      changeColumnNameAction,
      changeColumnCommentAction,
      changeColumnDataTypeAction,
      changeColumnDefaultAction,
    ],
    relationshipSortHook,
  ],
];
