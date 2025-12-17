import { redirect } from "next/navigation";

export default function HomePage() {
  // Server-side redirect to welcome page
  redirect("/welcome");
}