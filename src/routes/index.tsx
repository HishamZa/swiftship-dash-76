import { createFileRoute, redirect } from "@tanstack/react-router";

// The login page is the default landing route.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Almwanaa Company — شركة الموانئ" },
      { name: "description", content: "Track shipments and manage logistics." },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/auth", replace: true });
  },
  component: () => null,
});
