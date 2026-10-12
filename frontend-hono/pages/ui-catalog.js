// Auto-generated Catalog Page (/__ui)
import { Alert } from '../components/ui/alert.js';
import { Avatar } from '../components/ui/avatar.js';
import { Badge } from '../components/ui/badge.js';
import { Breadcrumb } from '../components/ui/breadcrumb.js';
import { Button } from '../components/ui/button.js';
import { Card } from '../components/ui/card.js';
import { Input } from '../components/ui/input.js';
import { Label } from '../components/ui/label.js';
import { Separator } from '../components/ui/separator.js';
import { Skeleton } from '../components/ui/skeleton.js';
import { Table } from '../components/ui/table.js';
import { Textarea } from '../components/ui/textarea.js';

export function renderUiCatalogPage() {
  return `
    <div class="p-8 max-w-5xl mx-auto space-y-6">
      <h1 class="text-3xl font-extrabold">Katalog UI Statis (/__ui)</h1>
      <p class="text-gray-600">Menampilkan hasil konversi komponen TSX ke fungsi JS + cva.</p>
      
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">alert</h2>
        <div>
          ${Alert({ children: 'Varian Utama Alert' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">avatar</h2>
        <div>
          ${Avatar({ children: 'Varian Utama Avatar' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">badge</h2>
        <div>
          ${Badge({ children: 'Varian Utama Badge' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">breadcrumb</h2>
        <div>
          ${Breadcrumb({ children: 'Varian Utama Breadcrumb' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">button</h2>
        <div>
          ${Button({ children: 'Varian Utama Button' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">card</h2>
        <div>
          ${Card({ children: 'Varian Utama Card' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">input</h2>
        <div>
          ${Input({ children: 'Varian Utama Input' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">label</h2>
        <div>
          ${Label({ children: 'Varian Utama Label' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">separator</h2>
        <div>
          ${Separator({ children: 'Varian Utama Separator' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">skeleton</h2>
        <div>
          ${Skeleton({ children: 'Varian Utama Skeleton' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">table</h2>
        <div>
          ${Table({ children: 'Varian Utama Table' })}
        </div>
      </section>
      <section class="p-4 border rounded-lg space-y-2">
        <h2 class="text-xl font-bold capitalize">textarea</h2>
        <div>
          ${Textarea({ children: 'Varian Utama Textarea' })}
        </div>
      </section>
    </div>
  `;
}
