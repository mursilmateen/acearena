import type { Game } from '@/types';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');

const DEFAULT_LIVE_GAME_TITLES = ['falling crown', 'space run'];

const parseBooleanEnv = (value: string | undefined, fallback: boolean) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const parseLiveGameTitlesEnv = (value: string | undefined) => {
  const parsedTitles = (value || '')
    .split(',')
    .map((title) => normalizeText(title))
    .filter(Boolean);

  return parsedTitles.length > 0
    ? parsedTitles
    : DEFAULT_LIVE_GAME_TITLES.map((title) => normalizeText(title));
};

export const LAUNCH_MODE_ENABLED = parseBooleanEnv(
  process.env.NEXT_PUBLIC_LAUNCH_MODE_ENABLED,
  true
);

export const GAME_UPLOAD_COMING_SOON = parseBooleanEnv(
  process.env.NEXT_PUBLIC_GAME_UPLOAD_COMING_SOON,
  true
);

export const LIVE_LAUNCH_GAME_TITLES = parseLiveGameTitlesEnv(
  process.env.NEXT_PUBLIC_LIVE_GAME_TITLES
);

const liveGameTitleSet = new Set(LIVE_LAUNCH_GAME_TITLES);

export const isLiveLaunchGameTitle = (title?: string | null) => {
  if (!title) {
    return false;
  }

  return liveGameTitleSet.has(normalizeText(title));
};

export const isLiveLaunchGame = (game?: Pick<Game, 'title'> | null) => {
  if (!LAUNCH_MODE_ENABLED) {
    return true;
  }

  return isLiveLaunchGameTitle(game?.title);
};

export const filterLiveLaunchGames = <T extends Pick<Game, 'title'>>(games: T[]) => {
  if (!LAUNCH_MODE_ENABLED) {
    return games;
  }

  return games.filter((game) => isLiveLaunchGame(game));
};