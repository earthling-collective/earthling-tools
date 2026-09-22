import { redirect } from "next/navigation";
import { generators } from "@/tools/generate/generators";

export default function Page() {
  redirect(`/generate/${generators[0].slug}`);
}
