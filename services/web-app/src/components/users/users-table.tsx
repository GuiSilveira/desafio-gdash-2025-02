import { useState, useMemo } from "react";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import { useUsers } from "@/hooks/use-users";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DataTableCard,
  DataTableContainer,
  DataTableEmptyState,
  DataTableSkeleton,
} from "@/components/ui/data-table";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { dataTableStyles } from "@/components/ui/data-table-styles";
import { usePagination } from "@/hooks/use-pagination";
import { useTableSort } from "@/hooks/use-table-sort";
import { Pencil, Trash2, Plus, Users, Shield, User as UserIcon } from "lucide-react";
import { UserFormDialog } from "./user-form-dialog";
import { DeleteDialog } from "./delete-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PAGINATION } from "@/constants/app";
import { getRoleBadgeConfig } from "@/utils/user";

type UserSortColumn = "name" | "email" | "role" | "createdAt";

function getSortValue(user: User, column: UserSortColumn): unknown {
  switch (column) {
    case "name":
      return user.name.toLowerCase();
    case "email":
      return user.email.toLowerCase();
    case "role":
      return user.roles.includes("admin") ? "a" : "z";
    case "createdAt":
      return new Date(user.createdAt).getTime();
    default:
      return null;
  }
}

function UsersTableSkeleton() {
  return (
    <DataTableSkeleton
      rows={5}
      showHeader={true}
      showAction={true}
      showPagination={true}
      titleWidth="140px"
      subtitleWidth="200px"
      actionWidth="140px"
    />
  );
}

export function UsersTable() {
  const [currentPage, setCurrentPage] = useState(1);

  const { users, total, totalPages, isLoading, createUser, updateUser, deleteUser } = useUsers({
    page: currentPage,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const pagination = usePagination({
    totalItems: total,
    itemsPerPage: PAGINATION.DEFAULT_PAGE_SIZE,
    initialPage: currentPage,
  });

  const { toggleSort, getSortDirection, sortData } =
    useTableSort<UserSortColumn>({
      initialColumn: "name",
      initialDirection: "asc",
    });

  const sortedUsers = useMemo(() => {
    if (!users) return [];
    return sortData(users, getSortValue);
  }, [users, sortData]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pagination.goToPage(page);
  };

  const handleCreate = async (data: CreateUserDto | UpdateUserDto) => {
    await createUser(data as CreateUserDto);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (data: CreateUserDto | UpdateUserDto) => {
    if (!editingUser) return;
    await updateUser({ id: editingUser._id, data: data as UpdateUserDto });
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    await deleteUser(deletingUser._id);
    setDeletingUser(null);
    if (users.length === 1 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return <UsersTableSkeleton />;
  }

  const getRoleBadge = (user: User) => {
    const config = getRoleBadgeConfig(user);
    const Icon = config.variant === "admin" ? Shield : UserIcon;
    return (
      <Badge className={`${config.bgClass} ${config.textClass} border-0 font-medium gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return "-";
    }
  };

  const actionButton = (
    <Button 
      onClick={() => setIsCreateDialogOpen(true)}
      className="bg-[#6C5CE7] hover:bg-[#5B4BD5] text-white rounded-xl shadow-md cursor-pointer"
    >
      <Plus className="mr-2 h-4 w-4" />
      Novo Usuário
    </Button>
  );

  return (
    <>
      <DataTableCard
        icon={Users}
        title="Gerenciar Usuários"
        subtitle={`${total} ${total === 1 ? "usuário cadastrado" : "usuários cadastrados"}`}
        action={actionButton}
        pagination={{
          currentPage,
          totalPages,
          pageNumbers: pagination.pageNumbers,
          onPageChange: handlePageChange,
          isFirstPage: currentPage === 1,
          isLastPage: currentPage === totalPages,
        }}
      >
        <DataTableContainer>
          <Table>
            <TableHeader>
              <TableRow className={dataTableStyles.tableHeaderRow}>
                <SortableTableHead
                  column="name"
                  sortDirection={getSortDirection("name")}
                  onSort={toggleSort}
                  className={dataTableStyles.tableHeaderCell}
                >
                  Nome
                </SortableTableHead>
                <SortableTableHead
                  column="email"
                  sortDirection={getSortDirection("email")}
                  onSort={toggleSort}
                  className={dataTableStyles.tableHeaderCell}
                >
                  Email
                </SortableTableHead>
                <SortableTableHead
                  column="role"
                  sortDirection={getSortDirection("role")}
                  onSort={toggleSort}
                  className={dataTableStyles.tableHeaderCell}
                >
                  Função
                </SortableTableHead>
                <SortableTableHead
                  column="createdAt"
                  sortDirection={getSortDirection("createdAt")}
                  onSort={toggleSort}
                  className={dataTableStyles.tableHeaderCell}
                >
                  Criado em
                </SortableTableHead>
                <TableHead className={`text-right ${dataTableStyles.tableHeaderCell}`}>
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <DataTableEmptyState
                  icon={Users}
                  title="Nenhum usuário encontrado"
                  description="Clique em 'Novo Usuário' para adicionar"
                  colSpan={5}
                />
              ) : (
                sortedUsers.map((user) => (
                  <TableRow 
                    key={user._id}
                    className={dataTableStyles.tableRow}
                  >
                    <TableCell className="font-medium text-[#2D3436] dark:text-[#F7F9FC]">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-[#636E72] dark:text-[#9BA6B5]">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user)}
                    </TableCell>
                    <TableCell className="text-[#636E72] dark:text-[#9BA6B5]">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingUser(user)}
                          className="h-9 w-9 rounded-xl hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:text-blue-400 transition-colors cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUser(user)}
                          className="h-9 w-9 rounded-xl hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DataTableContainer>
      </DataTableCard>

      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreate}
        mode="create"
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        onSubmit={handleUpdate}
        mode="edit"
        user={editingUser}
      />

      <DeleteDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
        onConfirm={handleDelete}
        userName={deletingUser?.name || ""}
      />
    </>
  );
}
