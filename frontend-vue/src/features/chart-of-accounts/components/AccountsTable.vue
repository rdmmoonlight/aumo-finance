<template>
    <div class="rounded-md border">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead class="w-[120px]">Kode Akun</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead class="text-right">Saldo Saat Ini</TableHead>
                    <TableHead class="w-[80px] text-right">Aksi</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <template v-if="props.isLoading">
                    <TableRow>
                        <TableCell colspan="5" class="h-24 text-center">
                            <div class="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 class="h-4 w-4 animate-spin" />
                                <span>Memuat data akun...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                </template>

                <template v-else-if="props.accounts.length === 0">
                    <TableRow>
                        <TableCell colspan="5" class="h-24 text-center text-muted-foreground">
                            Belum ada data akun buku besar.
                        </TableCell>
                    </TableRow>
                </template>

                <template v-else>
                    <TableRow v-for="account in props.accounts" :key="account.id">
                        <TableCell class="font-mono font-medium">
                            {{ account.code }}
                        </TableCell>
                        <TableCell>
                            <span :class="{ 'pl-4 text-muted-foreground': account.parentId }">
                                {{ account.name }}
                            </span>
                        </TableCell>
                        <TableCell>
                            <Badge :variant="getTypeBadgeVariant(account.type)">
                                {{ account.type }}
                            </Badge>
                        </TableCell>
                        <TableCell class="text-right font-mono">
                            {{ formatCurrency(account.balance) }}
                        </TableCell>
                        <TableCell class="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger as-child>
                                    <Button variant="ghost" class="h-8 w-8 p-0">
                                        <span class="sr-only">Buka menu</span>
                                        <MoreHorizontal class="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem @click="emit('edit-account', account)">
                                        <Pencil class="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem class="text-destructive focus:text-destructive"
                                        @click="emit('delete-account', account)">
                                        <Trash2 class="mr-2 h-4 w-4" />
                                        Hapus
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                </template>
            </TableBody>
        </Table>
    </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
import type { Account, AccountType } from '../types'

interface Props {
    accounts: Account[]
    isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    accounts: () => [],
    isLoading: false,
})

const emit = defineEmits<{
    'edit-account': [account: Account]
    'delete-account': [account: Account]
}>()

const getTypeBadgeVariant = (type: AccountType) => {
    switch (type) {
        case 'ASSET':
            return 'default'
        case 'LIABILITY':
            return 'destructive'
        case 'EQUITY':
            return 'secondary'
        case 'REVENUE':
            return 'outline'
        case 'EXPENSE':
            return 'secondary'
        default:
            return 'default'
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}
</script>