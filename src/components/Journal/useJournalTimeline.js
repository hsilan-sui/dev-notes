import {useMemo} from 'react';
import {realEntryOpacity} from './waveMath.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const dateFormatter = new Intl.DateTimeFormat('zh-Hant', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

export default function useJournalTimeline(items = []) {
  return useMemo(() => buildJournalTimeline(items), [items]);
}

export function buildJournalTimeline(items = []) {
  const entries = normalizeEntries(items).sort((a, b) => {
    if (a.dayKey === b.dayKey) {
      return a.title.localeCompare(b.title);
    }

    return a.dayKey.localeCompare(b.dayKey);
  });

  const entriesByDay = entries.reduce((lookup, entry) => {
    if (!lookup[entry.dayKey]) {
      lookup[entry.dayKey] = [];
    }

    lookup[entry.dayKey].push(entry);
    return lookup;
  }, {});

  const dayKeysWithEntries = Object.keys(entriesByDay).sort();
  const mostRecentDayKey = dayKeysWithEntries[dayKeysWithEntries.length - 1] || null;
  const dayOpacityByKey = dayKeysWithEntries.reduce((lookup, dayKey, index) => {
    lookup[dayKey] = dayKey === mostRecentDayKey ? 1 : realEntryOpacity(index, dayKeysWithEntries.length);
    return lookup;
  }, {});
  const days = buildContinuousDays(dayKeysWithEntries, entriesByDay, dayOpacityByKey);

  entries.forEach((entry, index) => {
    entry.realEntryIndex = index;
  });

  function getPrevDayWithEntry(dayKey) {
    const index = dayKeysWithEntries.indexOf(dayKey);
    return index > 0 ? dayKeysWithEntries[index - 1] : null;
  }

  function getNextDayWithEntry(dayKey) {
    const index = dayKeysWithEntries.indexOf(dayKey);
    return index >= 0 && index < dayKeysWithEntries.length - 1 ? dayKeysWithEntries[index + 1] : null;
  }

  return {
    days,
    entries,
    entriesByDay,
    dayKeysWithEntries,
    earliestDayKey: dayKeysWithEntries[0] || null,
    mostRecentDayKey,
    currentMoment: entries[entries.length - 1] || null,
    getPrevDayWithEntry,
    getNextDayWithEntry,
  };
}

function normalizeEntries(items) {
  return items
    .map((item) => {
      const content = item.content || item;
      const metadata = content.metadata || {};
      const dayKey = dayKeyFromMetadata(metadata);

      if (!dayKey) {
        return null;
      }

      const frontMatter = metadata.frontMatter || content.frontMatter || {};

      return {
        title: metadata.title || frontMatter.title || '',
        formattedDate: metadata.formattedDate || dateFormatter.format(dateFromDayKey(dayKey)),
        readingTimeMinutes: normalizeReadingTime(metadata.readingTime),
        imageUrl: frontMatter.image || undefined,
        previewText: metadata.description || frontMatter.description || undefined,
        tags: normalizeTags(metadata.tags || frontMatter.tags),
        permalink: metadata.permalink,
        date: dateFromDayKey(dayKey),
        dayKey,
        realEntryIndex: 0,
        // The real post's MDX component, so the Journal can expand the full
        // entry in place instead of navigating away to the default blog post page.
        Content: content,
      };
    })
    .filter(Boolean);
}

function normalizeReadingTime(readingTime) {
  if (typeof readingTime === 'number') {
    return Math.max(1, Math.round(readingTime));
  }

  return undefined;
}

function normalizeTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .map((tag) => {
      if (typeof tag === 'string') {
        return tag;
      }

      return tag.label || tag.name || null;
    })
    .filter(Boolean);
}

function dayKeyFromMetadata(metadata) {
  if (typeof metadata.date === 'string' && metadata.date.length >= 10) {
    return metadata.date.slice(0, 10);
  }

  if (metadata.date instanceof Date) {
    return metadata.date.toISOString().slice(0, 10);
  }

  return null;
}

function buildContinuousDays(dayKeysWithEntries, entriesByDay, dayOpacityByKey) {
  if (dayKeysWithEntries.length === 0) {
    return [];
  }

  const days = [];
  let cursor = dateFromDayKey(dayKeysWithEntries[0]);
  const end = dateFromDayKey(dayKeysWithEntries[dayKeysWithEntries.length - 1]);

  while (cursor.getTime() <= end.getTime()) {
    const dayKey = cursor.toISOString().slice(0, 10);
    days.push({
      dayKey,
      date: dateFromDayKey(dayKey),
      entries: entriesByDay[dayKey] || [],
      opacity: dayOpacityByKey[dayKey],
    });
    cursor = new Date(cursor.getTime() + DAY_MS);
  }

  return days;
}

function dateFromDayKey(dayKey) {
  return new Date(`${dayKey}T00:00:00.000Z`);
}
