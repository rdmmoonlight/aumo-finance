<script setup lang="ts">
import { ref } from 'vue'

// Data Display
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Form & Inputs
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

// Navigation & Layout
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@/components/ui/navigation-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

// Overlays, Dialogs & Modals
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// Disclosure & Organization
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// Feedback & Status
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'vue-sonner'

// State lokal untuk pengujian interaktif
const checkboxVal = ref(true)
const radioVal = ref('option-one')
const toggleGroupVal = ref(['bold'])
const isCollapsibleOpen = ref(false)
</script>

<template>
  <div class="container mx-auto p-8 space-y-12 pb-24">
    <div class="space-y-2 border-b pb-4">
      <h1 class="text-3xl font-bold tracking-tight">Gallery Showcase Komponen (Uji Visual)</h1>
      <p class="text-muted-foreground">Halaman pengujian internal untuk verifikasi varian dan *state* UI. Dihapus pada Fase 10.</p>
    </div>

    <!-- 1. DATA DISPLAY & TYPOGRAPHY -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">1. Data Display & Typography</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        <!-- Label, Badge & Avatar -->
        <Card>
          <CardHeader>
            <CardTitle>Badge, Avatar & Label</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="space-y-2">
              <Label>Varian Badge:</Label>
              <div class="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            <Separator />

            <div class="space-y-2">
              <Label>Avatar:</Label>
              <div class="flex gap-4 items-center">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>GH</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Skeleton -->
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loader</CardTitle>
          </CardHeader>
          <CardContent class="flex items-center space-x-4">
            <Skeleton class="h-12 w-12 rounded-full" />
            <div class="space-y-2 flex-1">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-[4/5]" />
            </div>
          </CardContent>
        </Card>

        <!-- Table -->
        <Card class="md:col-span-2">
          <CardHeader>
            <CardTitle>Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Daftar transaksi pengujian.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-[100px]">ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead class="text-right">Jumlah</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell class="font-medium">INV-001</TableCell>
                  <TableCell><Badge variant="outline">Paid</Badge></TableCell>
                  <TableCell>Transfer BRI</TableCell>
                  <TableCell class="text-right">Rp 250.000</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell class="font-medium">INV-002</TableCell>
                  <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                  <TableCell>QRIS</TableCell>
                  <TableCell class="text-right">Rp 120.000</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- 2. FORM & INPUTS -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">2. Form & Inputs</h2>
      <Card>
        <CardContent class="pt-6 space-y-6">
          <!-- Button Variants -->
          <div class="space-y-2">
            <Label>Varian Button:</Label>
            <div class="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>

          <Separator />

          <!-- Text Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="input-demo">Input Text</Label>
              <Input id="input-demo" placeholder="Ketik sesuatu di sini..." />
            </div>
            <div class="space-y-2">
              <Label for="select-demo">Select</Label>
              <Select>
                <SelectTrigger id="select-demo">
                  <SelectValue placeholder="Pilih Opsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opt1">Opsi Pertama</SelectItem>
                  <SelectItem value="opt2">Opsi Kedua</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2 md:col-span-2">
              <Label for="textarea-demo">Textarea</Label>
              <Textarea id="textarea-demo" placeholder="Tuliskan catatan detail..." />
            </div>
          </div>

          <Separator />

          <!-- Selection Controls -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <Label>Checkbox</Label>
              <div class="flex items-center space-x-2">
                <Checkbox id="terms" v-model:checked="checkboxVal" />
                <label for="terms" class="text-sm font-medium leading-none">Setuju dengan syarat</label>
              </div>
            </div>

            <div class="space-y-2">
              <Label>Radio Group</Label>
              <RadioGroup v-model="radioVal">
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="r1" value="option-one" />
                  <Label for="r1">Metode A</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <RadioGroupItem id="r2" value="option-two" />
                  <Label for="r2">Metode B</Label>
                </div>
              </RadioGroup>
            </div>

            <div class="space-y-2">
              <Label>Toggle & Toggle Group</Label>
              <div class="flex items-center gap-4">
                <Toggle aria-label="Toggle bold">Bold</Toggle>
                <ToggleGroup type="multiple" v-model="toggleGroupVal">
                  <ToggleGroupItem value="bold">B</ToggleGroupItem>
                  <ToggleGroupItem value="italic">I</ToggleGroupItem>
                  <ToggleGroupItem value="underline">U</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 3. NAVIGATION & LAYOUT -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">3. Navigation & Layout</h2>
      <Card>
        <CardContent class="pt-6 space-y-6">
          <div>
            <Label class="mb-2 block">Breadcrumb:</Label>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="#">Features</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Gallery</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <Separator />

          <div>
            <Label class="mb-2 block">Navigation Menu:</Label>
            <NavigationMenu>
              <NavigationMenuList class="flex gap-2">
                <NavigationMenuItem>
                  <NavigationMenuLink class="px-3 py-2 text-sm rounded-md hover:bg-accent">Dashboard</NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink class="px-3 py-2 text-sm rounded-md hover:bg-accent">Pengaturan</NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <Separator />

          <div>
            <Label class="mb-2 block">Scroll Area:</Label>
            <ScrollArea class="h-28 w-full rounded-md border p-4">
              <div class="space-y-2">
                <p v-for="n in 10" :key="n" class="text-sm">Item daftar panjang ke-{{ n }}</p>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 4. OVERLAYS, DIALOGS & MODALS -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">4. Overlays & Modals</h2>
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-wrap gap-4">
            
            <!-- Dialog -->
            <Dialog>
              <DialogTrigger as-child><Button variant="outline">Buka Dialog</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog Modal</DialogTitle>
                  <DialogDescription>Konten dialog standar untuk pengujian.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="secondary">Tutup</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <!-- Alert Dialog -->
            <AlertDialog>
              <AlertDialogTrigger as-child><Button variant="destructive">Buka Alert Dialog</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Tindakan</AlertDialogTitle>
                  <AlertDialogDescription>Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction>Lanjutkan</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <!-- Sheet -->
            <Sheet>
              <SheetTrigger as-child><Button variant="outline">Buka Sheet (Drawer)</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Panel Samping</SheetTitle>
                  <SheetDescription>Konten sheet dari sisi kanan layar.</SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>

            <!-- Popover -->
            <Popover>
              <PopoverTrigger as-child><Button variant="outline">Buka Popover</Button></PopoverTrigger>
              <PopoverContent class="w-64">
                <p class="text-sm">Ini adalah kontainer popover untuk informasi tambahan singkat.</p>
              </PopoverContent>
            </Popover>

            <!-- Dropdown Menu -->
            <DropdownMenu>
              <DropdownMenuTrigger as-child><Button variant="outline">Dropdown Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Pengaturan</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Tooltip -->
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as-child><Button variant="ghost">Arahkan Mouse (Tooltip)</Button></TooltipTrigger>
                <TooltipContent>
                  <p>Informasi tooltip bantuan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        </CardContent>
      </Card>
    </section>

    <!-- 5. DISCLOSURE & ORGANIZATION -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">5. Disclosure & Organization</h2>
      <Card>
        <CardContent class="pt-6 space-y-6">
          <!-- Tabs -->
          <Tabs default-value="tab-1" class="w-full">
            <TabsList>
              <TabsTrigger value="tab-1">Tab Utama</TabsTrigger>
              <TabsTrigger value="tab-2">Tab Sekunder</TabsTrigger>
            </TabsList>
            <TabsContent value="tab-1" class="p-4 border rounded-md mt-2">
              Isi panel untuk Tab Utama.
            </TabsContent>
            <TabsContent value="tab-2" class="p-4 border rounded-md mt-2">
              Isi panel untuk Tab Sekunder.
            </TabsContent>
          </Tabs>

          <Separator />

          <!-- Collapsible -->
          <Collapsible v-model:open="isCollapsibleOpen" class="space-y-2">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold">Detail Tersembunyi (Collapsible)</h4>
              <CollapsibleTrigger as-child>
                <Button variant="ghost" size="sm">
                  {{ isCollapsibleOpen ? 'Tutup' : 'Buka' }}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent class="space-y-2">
              <div class="rounded-md border px-4 py-2 text-sm">
                Ini adalah konten yang bisa di-expand atau di-collapse secara terpisah.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </section>

    <!-- 6. FEEDBACK & STATUS -->
    <section class="space-y-4">
      <h2 class="text-xl font-semibold">6. Feedback & Status</h2>
      <Card>
        <CardContent class="pt-6 space-y-4">
          <!-- Alert -->
          <Alert>
            <AlertTitle>Perhatian!</AlertTitle>
            <AlertDescription>Ini adalah komponen alert standar untuk informasi penting.</AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <AlertTitle>Gagal!</AlertTitle>
            <AlertDescription>Terjadi kesalahan pada sistem, silakan coba lagi nanti.</AlertDescription>
          </Alert>

          <!-- Sonner Toast Trigger -->
          <div>
            <Button @click="toast('Notifikasi berhasil dipicu!', { description: 'Pesan toaster Sonner berfungsi dengan baik.' })">
              Uji Notifikasi Toast (Sonner)
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>