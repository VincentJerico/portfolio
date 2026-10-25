'use client';

import { useEffect } from 'react';

function openTicket(ticket: Element | null) {
  if (ticket instanceof HTMLDetailsElement) ticket.open = true;
  return ticket;
}

/**
 * Makes ticket links useful (P4): a `#ticket-ID` hash opens that ticket, and a severity count in the
 * run summary opens every ticket of that severity. Without JS the links still jump to the ticket.
 */
export function TicketOpener() {
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id.startsWith('ticket-')) openTicket(document.getElementById(id))?.scrollIntoView();
    };
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[data-open-severity]');
      if (!link) return;
      const tickets = document.querySelectorAll(
        `[data-ticket-severity="${link.dataset.openSeverity}"]`,
      );
      tickets.forEach(openTicket);
    };

    fromHash();
    window.addEventListener('hashchange', fromHash);
    document.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('hashchange', fromHash);
      document.removeEventListener('click', onClick);
    };
  }, []);

  return null;
}
