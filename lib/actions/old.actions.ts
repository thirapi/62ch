"use server"

import { createThread as baseCreateThread } from "./thread.actions";
import { createReply as baseCreateReply } from "./reply.actions";
import { redirect } from "next/navigation";

export async function oldCreateThread(formData: FormData) {
  const result = await baseCreateThread(formData);
  const boardCode = formData.get("boardCode") as string;
  if (result.success) {
    redirect(`/${boardCode}`);
  } else {
    redirect(`/${boardCode}?error=${encodeURIComponent(result.error || "Unknown error")}`);
  }
}

export async function oldCreateReply(formData: FormData) {
  const result = await baseCreateReply(formData);
  const boardCode = formData.get("boardCode") as string;
  const threadId = formData.get("threadId") as string;
  if (result.success) {
    redirect(`/${boardCode}/thread/${threadId}`);
  } else {
    redirect(`/${boardCode}/thread/${threadId}?error=${encodeURIComponent(result.error || "Unknown error")}`);
  }
}
