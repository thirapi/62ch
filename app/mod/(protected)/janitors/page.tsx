import { Plus, UserCog, UserMinus, Shield, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getJanitors } from "@/lib/actions/janitor.actions";
import { getAllBoards } from "@/lib/actions/board.actions";
import { JanitorManager } from "./janitor-manager";

export default async function JanitorsPage() {
  const [janitors, allBoards] = await Promise.all([
    getJanitors(),
    getAllBoards()
  ]);

  return (
    <div className="space-y-6">
      <header className="mb-0">
        <h1 className="text-2xl font-bold tracking-tight">Manajemen Janitor</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
          Kelola moderator tingkat board (Janitor) dan penugasan akses mereka secara spesifik
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6">
          <JanitorManager initialJanitors={janitors} allBoards={allBoards} />
      </div>
    </div>
  );
}
