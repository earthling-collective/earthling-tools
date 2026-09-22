import { redirect } from "next/navigation";
import { textTransforms } from "@/tools/text/transforms";

export default function Page() {
  redirect(`/text/${textTransforms[0].slug}`);
}
