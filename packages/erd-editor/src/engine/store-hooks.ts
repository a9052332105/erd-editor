import { cancel, type Channel, channel, go, put } from '@dineug/go';
import { type AnyAction } from '@dineug/r-html';
import { arrayHas } from '@dineug/shared';

import { hooks as relationshipHooks } from '@/engine/modules/relationship/hooks';
import { hooks as tableHooks } from '@/engine/modules/table/hooks';
import { hooks as tableColumnHooks } from '@/engine/modules/table-column/hooks';
import type { Store } from '@/engine/store';

type Task = {
  pattern: ReturnType<typeof arrayHas<string>>;
  channel: Channel<AnyAction>;
  proc: Promise<any>;
};

const hooks = [...tableHooks, ...tableColumnHooks, ...relationshipHooks];

export function createHooks(store: Store) {
  const getState = () => store.state;

  const tasks: Task[] = hooks.map(([pattern, hook]) => {
    const ch = channel();

    return {
      pattern: arrayHas(pattern.map(String)),
      channel: ch,
      proc: go(hook, ch, getState, store.context),
    };
  });

  const unsubscribe = store.subscribe(actions => {
    for (const action of actions) {
      for (const task of tasks) {
        if (task.pattern(action.type)) {
          put(task.channel, action);
        }
      }
    }
  });

  const destroy = () => {
    tasks.forEach(({ proc }) => cancel(proc));
    tasks.splice(0, tasks.length);
    unsubscribe();
  };

  return { destroy };
}
