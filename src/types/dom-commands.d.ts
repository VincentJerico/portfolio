// Invoker commands and dialog light-dismiss are native HTML attributes React passes through
// but does not type yet. Used by the mobile drawer so it opens without JavaScript.
/* eslint-disable @typescript-eslint/no-unused-vars -- declaration merging must repeat React's type parameter */
import 'react';

declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?: 'show-modal' | 'close' | 'request-close' | (string & {});
  }
  interface DialogHTMLAttributes<T> {
    closedby?: 'any' | 'closerequest' | 'none';
  }
}
