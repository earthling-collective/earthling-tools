import { redirect } from "next/navigation";

// The family lives at /hash/[algo]; the bare path picks the default
export default function Page() {
  redirect("/hash/sha256");
}
