import AboutPage from '#/features/about/about-page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/about')({
  component: AboutPage,
});
