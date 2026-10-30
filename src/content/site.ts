// The only content source for the site: every line of copy and the booking URL.
// Components read from `site` and never hard code text.

// One piece of a privacy paragraph: plain text, an outside link, or the footer
// email as a mailto link (so the address lives in one place). Parts join with
// no added spaces; each string carries its own spaces and punctuation.
export type PrivacyPart = string | { text: string; href: string } | { email: true };

export interface SiteContent {
  name: string;
  bookingUrl: string;
  // Umami Cloud counting (spec 0010). Configuration, not copy: values from the
  // tracking code Umami shows for the website.
  analytics: {
    scriptUrl: string;
    websiteId: string;
    // The only hostname Umami counts on (its `data-domains`).
    domain: string;
    // The `data-umami-event` name on every booking link.
    bookEvent: string;
  };
  meta: {
    title: string;
    description: string;
    // The Person in the JSON-LD block (spec 0011).
    founder: string;
    // The 1200×630 sharing card drawn at build (spec 0011).
    card: {
      tagline: string;
      alt: string;
    };
  };
  a11y: {
    skipLink: string;
  };
  cta: {
    bookLabel: string;
  };
  nav: {
    // The aria-label of <nav>.
    label: string;
    tools: string;
    services: string;
    about: string;
  };
  home: {
    eyebrow: string;
    // Split so the underlined part needs no words in the component.
    heading: {
      before: string;
      emphasis: string;
      after: string;
    };
    intro: string;
  };
  tools: {
    label: string;
    // Display order. Only tools Abed confirmed using (spec 0006).
    items: string[];
  };
  services: {
    automation: { title: string; body: string };
    web: { title: string; body: string };
  };
  about: {
    title: string;
    // One item per paragraph.
    body: string[];
    // The photo itself is `src/assets/abed.png`, imported by the page.
    photoAlt: string;
  };
  finalCta: {
    title: string;
    body: string;
  };
  privacy: {
    title: string;
    updatedLabel: string;
    // ISO date (YYYY-MM-DD) of the last wording change; formatted when rendered.
    updated: string;
    // One entry per h3 and paragraph, in display order (spec 0007).
    sections: { heading: string; body: PrivacyPart[] }[];
  };
  footer: {
    // `{year}` is replaced with the build year when rendered.
    copyright: string;
    email: string;
    privacyLabel: string;
  };
  notFound: {
    title: string;
    code: string;
    heading: string;
    body: string;
    homeLabel: string;
  };
}

export const site = {
  name: 'Abed Automation',
  bookingUrl: 'https://cal.com/abed-automation/intro-call',
  analytics: {
    scriptUrl: 'https://cloud.umami.is/script.js',
    websiteId: '15d2c8d1-91bd-4e51-8897-f7ec3bb4fa6c',
    domain: 'abedautomation.com',
    bookEvent: 'book-call',
  },
  meta: {
    title: 'Abed Automation · AI automation, websites, and web apps',
    description:
      'Abed Fataftah builds AI automation, websites, and custom web apps for small businesses. Start with a free 30 minute call.',
    founder: 'Abed Fataftah',
    card: {
      tagline: 'AI automation, websites, and web apps for small businesses.',
      alt: 'Abed Automation: AI automation, websites, and web apps for small businesses.',
    },
  },
  a11y: {
    skipLink: 'Skip to content',
  },
  cta: {
    bookLabel: 'Book a Free Call',
  },
  nav: {
    label: 'Main',
    tools: 'Tools',
    services: 'Services',
    about: 'About',
  },
  home: {
    eyebrow: 'Hi, I’m Abed.',
    heading: {
      before: 'I build ',
      emphasis: 'AI automation',
      after: ', websites, and web apps for small businesses.',
    },
    intro:
      'I help you cut repetitive work and get the website or app your business needs. It starts with a free 30 minute call.',
  },
  tools: {
    label: 'Tools I work with:',
    items: [
      'n8n',
      'OpenAI',
      'Claude',
      'TypeScript',
      'React',
      'Astro',
      'Tailwind CSS',
      'Node.js',
      'PostgreSQL',
    ],
  },
  services: {
    automation: {
      title: 'AI Automation',
      body: 'I connect the tools you already use, such as Gmail, Slack, and Telegram, and add AI to handle the repetitive steps in between. Sorting incoming messages, drafting replies, and routine updates are good places to start.',
    },
    web: {
      title: 'Websites and Web Apps',
      body: 'I build business websites and custom web applications, from a clear site that explains what you offer to a tool shaped around how you work. The focus is practical features that work as intended.',
    },
  },
  about: {
    title: 'About',
    body: [
      'I’m Abed Fataftah, the developer behind Abed Automation. I work remotely with businesses to turn practical needs into working software: websites, web applications, and AI automation.',
      'Before this, I spent five years running a lighting retail business, handling sales, customers, and daily operations. It taught me how much time everyday tasks can take, and to start from the problem the software needs to solve. I also hold a master’s degree in Computer Science.',
      'My projects include a website for an event and talent agency and AI assistant workflows built with n8n. I’m currently building an ecommerce platform, which is still in development.',
      'I start by understanding the business problem, then break the work into clear, manageable steps. I keep communication straightforward and check that what I build works as intended.',
    ],
    photoAlt: 'Abed Fataftah, wearing a navy suit jacket over a dark shirt.',
  },
  finalCta: {
    title: 'Have a website, web app, or automation need? Let’s talk.',
    body: 'In a free 30 minute call with no obligation, you tell me what you need and I’ll share how I’d approach it.',
  },
  privacy: {
    title: 'Privacy',
    updatedLabel: 'Last updated',
    updated: '2026-10-30',
    sections: [
      {
        heading: 'Who runs this site',
        body: [
          'This site is run by Abed Fataftah, trading as Abed Automation. For any question about your data, email ',
          { email: true },
          '.',
        ],
      },
      {
        heading: 'Visiting this site',
        body: [
          'The site sets no cookies. To see how many people visit and which booking button they use, it counts visits with Umami, a privacy friendly service that works without cookies. Umami records the page you open, the site that sent you, and your country, browser, and device type, never your name or email address. This data is stored in the EU and kept for six months. See ',
          { text: 'Umami’s privacy policy', href: 'https://umami.is/privacy' },
          '. Apart from Umami, the site loads nothing from other companies while you read it. It is hosted by Netlify, which processes technical details of each visit, such as your IP address, browser, and the page you open, to deliver the site and keep it secure. See ',
          { text: 'Netlify’s privacy policy', href: 'https://www.netlify.com/privacy/' },
          '.',
        ],
      },
      {
        heading: 'Booking a call',
        body: [
          'Booking happens on Cal.com, which collects your name, your email address, and any note you add. The booking is then added to my Google Workspace calendar with a Google Meet link. Calls are never recorded. See the privacy policies of ',
          { text: 'Cal.com', href: 'https://cal.com/privacy' },
          ' and ',
          { text: 'Google', href: 'https://policies.google.com/privacy' },
          '.',
        ],
      },
      {
        heading: 'Emailing me',
        body: [
          'If you email me, your message is kept in my Google Workspace mailbox, which Google hosts.',
        ],
      },
      {
        heading: 'How I use and keep your details',
        body: [
          'I use your details only to reply to you, prepare the call, and do any work you ask me to do. I never sell them or send you marketing emails. I keep them for as long as that conversation or project needs them, and if no work follows, I delete them within 12 months of the last contact. Netlify, Cal.com, and Google may store data outside your country, including in the United States.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can ask to see, correct, or delete your details, or object to how they are used, by emailing ',
          { email: true },
          '. I’ll reply within 21 days. You can also complain to the data protection authority where you live.',
        ],
      },
    ],
  },
  footer: {
    copyright: '© {year} Abed Automation',
    email: 'abed@abedautomation.com',
    privacyLabel: 'Privacy',
  },
  notFound: {
    title: 'Page not found · Abed Automation',
    code: '404',
    heading: 'This page doesn’t exist.',
    body: 'The link may be broken, or the page may have moved.',
    homeLabel: 'Back to the home page',
  },
} satisfies SiteContent;

function assertBookingUrl(value: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`site.bookingUrl is not a valid URL: "${value}"`);
  }
  if (url.protocol !== 'https:') {
    throw new Error(`site.bookingUrl must use https: "${value}"`);
  }
  if (url.hostname !== 'cal.com') {
    throw new Error(`site.bookingUrl must be a cal.com link: "${value}"`);
  }
}

assertBookingUrl(site.bookingUrl);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertAnalytics(value: SiteContent['analytics']): void {
  let url: URL;
  try {
    url = new URL(value.scriptUrl);
  } catch {
    throw new Error(`site.analytics.scriptUrl is not a valid URL: "${value.scriptUrl}"`);
  }
  if (url.protocol !== 'https:') {
    throw new Error(`site.analytics.scriptUrl must use https: "${value.scriptUrl}"`);
  }
  if (url.hostname !== 'umami.is' && !url.hostname.endsWith('.umami.is')) {
    throw new Error(`site.analytics.scriptUrl must be an umami.is link: "${value.scriptUrl}"`);
  }
  if (!UUID.test(value.websiteId)) {
    throw new Error(`site.analytics.websiteId must be a UUID: "${value.websiteId}"`);
  }
  if (value.domain !== 'abedautomation.com') {
    throw new Error(`site.analytics.domain must be abedautomation.com: "${value.domain}"`);
  }
}

assertAnalytics(site.analytics);
