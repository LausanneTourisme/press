export const blankable = (href: string | undefined): string | undefined => href && href.includes('http') ? '_blank' : undefined;

export const once = (fn: ((this: unknown, event: Event) => void) | null | undefined): (this: unknown, event: Event) => void => {
  return function(this: unknown, event: Event): void {
    fn?.call(this, event);
    fn = null; // Sets fn to null after it has been called once
  };
};

export const preventDefault = (fn: ((this: unknown, event: Event) => void) | null | undefined): (this: unknown, event: Event) => void => {
  return function(event) {
    event.preventDefault();
    fn?.call(this, event);
  };
};
