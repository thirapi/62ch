import { Plus, Settings, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { deleteCategory, getAllCategories } from "@/lib/actions/category.actions";
import { CategoryFormDialog } from "@/components/mod/category-form-dialog";
import { CategoryDeleteButton } from "@/components/mod/category-delete-button";
import { CategoryReorderButtons } from "@/components/mod/category-reorder-buttons";

export default async function CategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <header className="mb-0">
          <h1 className="text-2xl font-bold tracking-tight">Manajemen Kategori</h1>
          <p className="text-xs text-muted-foreground mt-1 mb-4 opacity-70">
            Kelola pengelompokan board berdasarkan topik utama
          </p>
        </header>
        <CategoryFormDialog mode="create">
          <Button className="flex items-center gap-2 rounded-full px-5 shadow-none h-9">
            <Plus className="h-4 w-4" />
            Kategori Baru
          </Button>
        </CategoryFormDialog>
      </div>

      <Card className="rounded-xl border shadow-sm overflow-hidden p-0 gap-0">
        <div className="flex items-center justify-between h-12 px-4 border-b bg-muted/5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight">Katalog Kategori</span>
            <span className="text-[10px] text-muted-foreground opacity-60">({categories.length} item)</span>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="h-10">Nama Kategori</TableHead>
                <TableHead className="h-10">Urutan</TableHead>
                <TableHead className="text-right h-10 px-4">Kendali</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat, index) => (
                <TableRow key={cat.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-primary/80">{cat.name}</TableCell>
                  <TableCell className="text-xs font-mono">{cat.displayOrder}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <CategoryReorderButtons 
                      categoryId={cat.id} 
                      isFirst={index === 0} 
                      isLast={index === categories.length - 1} 
                    />
                    <CategoryFormDialog mode="edit" initialCategory={cat}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Settings className="h-4 w-4 opacity-60" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </CategoryFormDialog>
                    <CategoryDeleteButton categoryId={cat.id} categoryName={cat.name} />
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Belum ada kategori yang terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
