import { CommandKey, CommandTypeAll } from '@@types/engine/command';
import { State } from '@@types/engine/store';
import { Helper } from '@@types/core/helper';
import { Observable, Subscription } from 'rxjs';
import { commandsFilter } from '@/core/operators/commandsFilter';
import { recalculatingTableWidth } from '@/engine/store/helper/table.helper';

const hookKeys: CommandKey[] = ['editor.loadJson', 'editor.initLoadJson'];

export const useRecalculatingTableWidth = (
  hook$: Observable<Array<CommandTypeAll>>,
  { tableState: { tables } }: State,
  helper: Helper
): Subscription =>
  hook$
    .pipe(commandsFilter(hookKeys))
    .subscribe(() => recalculatingTableWidth(tables, helper));
