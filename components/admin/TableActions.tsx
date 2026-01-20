"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, LucideIcon } from "lucide-react";

export interface TableAction<T> {
  label: string;
  icon: LucideIcon;
  onClick: (row: T) => void;
  variant?: "default" | "destructive";
}

interface TableActionsProps<T> {
  row: T;
  actions: TableAction<T>[];
}

export function TableActions<T>({ row, actions }: TableActionsProps<T>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(row)}
              variant={action.variant}
            >
              <Icon className="h-4 w-4 mr-2" />
              {action.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
