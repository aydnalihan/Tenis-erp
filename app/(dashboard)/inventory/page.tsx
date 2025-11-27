'use client';

import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package,
  AlertTriangle,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const inventory = [
  { id: '1', name: 'Wilson Pro Staff Raket', category: 'Raket', quantity: 24, minStock: 10, description: 'Profesyonel tenis raketi', lastUpdated: '2024-11-20' },
  { id: '2', name: 'Penn Championship Toplar', category: 'Top', quantity: 156, minStock: 50, description: '3lü paket tenis topu', lastUpdated: '2024-11-22' },
  { id: '3', name: 'Tenis Filesi', category: 'Ekipman', quantity: 8, minStock: 4, description: 'Standart kort filesi', lastUpdated: '2024-11-15' },
  { id: '4', name: 'Top Sepeti', category: 'Ekipman', quantity: 6, minStock: 4, description: '150 top kapasiteli', lastUpdated: '2024-11-10' },
  { id: '5', name: 'Çocuk Raketi (21 inch)', category: 'Raket', quantity: 12, minStock: 8, description: '6-8 yaş için uygun', lastUpdated: '2024-11-18' },
  { id: '6', name: 'Antrenman Konileri', category: 'Ekipman', quantity: 3, minStock: 10, description: '20li set', lastUpdated: '2024-11-01' },
  { id: '7', name: 'Grip Bandı', category: 'Aksesuar', quantity: 45, minStock: 20, description: 'Overgrip paketi', lastUpdated: '2024-11-19' },
];

const categories = ['Tümü', 'Raket', 'Top', 'Ekipman', 'Aksesuar'];

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');

  const lowStockItems = inventory.filter(item => item.quantity < item.minStock);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: typeof inventory[0]) => {
    const ratio = item.quantity / item.minStock;
    if (ratio < 0.5) return { label: 'Kritik', color: 'bg-red-100 text-red-700 border-0' };
    if (ratio < 1) return { label: 'Düşük', color: 'bg-amber-100 text-amber-700 border-0' };
    return { label: 'Yeterli', color: 'bg-green-100 text-green-700 border-0' };
  };

  return (
    <div className="space-y-4 sm:space-y-6 page-transition">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Envanter</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Kulüp ekipman ve malzemelerini yönetin
          </p>
        </div>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 text-sm w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Yeni Ekipman Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
              <span className="truncate">Ürün Tipi</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">
              <span className="truncate">Toplam Stok</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{totalItems}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-2">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
              <span className="truncate">Düşük Stok</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white border-green-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-500">
              Kategoriler
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">{categories.length - 1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-amber-800 text-sm sm:text-base">Stok Uyarısı</p>
                <p className="text-xs sm:text-sm text-amber-700 mt-1">
                  {lowStockItems.length} ürünün stok seviyesi minimum seviyenin altında
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="bg-white border-green-100 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Ekipman ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-11 h-10 sm:h-11 border-green-200 focus:border-green-400 focus:ring-green-200 rounded-xl text-sm"
              />
            </div>

            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs sm:text-sm h-8 px-2 sm:px-3 ${selectedCategory === cat 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'border-green-200 text-gray-600 hover:bg-green-50 hover:text-green-700'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List - Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {filteredInventory.map((item) => {
          const status = getStockStatus(item);
          return (
            <Card key={item.id} className="bg-white border-green-100 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">{item.category}</Badge>
                      <Badge className={`${status.color} text-[10px]`}>{status.label}</Badge>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-gray-800">{item.quantity}</p>
                    <p className="text-[10px] text-gray-400">min: {item.minStock}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-green-100 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-green-200 text-green-700 hover:bg-green-50">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Ekle
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8 border-green-200 text-amber-600 hover:bg-amber-50">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    Çıkar
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-green-100">
                      <DropdownMenuItem className="cursor-pointer text-sm">
                        <Edit className="h-4 w-4 mr-2 text-gray-400" />
                        Düzenle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-green-100" />
                      <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer text-sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Inventory Table - Desktop */}
      <Card className="hidden lg:block bg-white border-green-100 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-gray-900">Envanter Listesi</CardTitle>
          <CardDescription className="text-gray-400">
            Tüm ekipman ve malzemelerin stok durumu
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <Table>
            <TableHeader>
              <TableRow className="border-green-100 hover:bg-transparent">
                <TableHead className="text-gray-500">Ürün</TableHead>
                <TableHead className="text-gray-500">Kategori</TableHead>
                <TableHead className="text-center text-gray-500">Stok</TableHead>
                <TableHead className="text-center text-gray-500">Min. Stok</TableHead>
                <TableHead className="text-gray-500">Durum</TableHead>
                <TableHead className="text-gray-500">Son Güncelleme</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <TableRow key={item.id} className="border-green-50 hover:bg-green-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 border-0">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-lg text-gray-800">{item.quantity}</span>
                    </TableCell>
                    <TableCell className="text-center text-gray-400">{item.minStock}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(item.lastUpdated).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-700 hover:bg-green-50">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-green-100">
                          <DropdownMenuItem className="cursor-pointer">
                            <ArrowUp className="h-4 w-4 mr-2 text-green-600" />
                            Stok Ekle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <ArrowDown className="h-4 w-4 mr-2 text-amber-600" />
                            Stok Çıkar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-green-100" />
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="h-4 w-4 mr-2 text-gray-400" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 hover:bg-red-50 cursor-pointer">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
