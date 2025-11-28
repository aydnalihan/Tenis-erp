'use client';

import { useState, useEffect } from 'react';
import { inventoryService } from '@/services/inventory.service';
import type { InventoryItem } from '@/types';
import { toast } from 'sonner';
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
import { StatsCard } from '@/components/shared';
import { InventoryFormDialog } from '@/components/inventory/inventory-form-dialog';
import { InventoryFormValues } from '@/lib/validations/inventory';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAll();
      if (response.success && response.data) {
        setInventory(response.data);
      } else {
        setInventory([]);
      }
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      toast.error(error?.message || 'Envanter yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from inventory
  const categories = ['Tümü', ...Array.from(new Set(inventory.map(item => item.category || 'Diğer')))];
  
  const lowStockItems = inventory.filter(item => (item.quantity || 0) < (item.min_stock || 0));
  const totalItems = inventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    const quantity = item.quantity || 0;
    const minStock = item.min_stock || 1;
    const ratio = quantity / minStock;
    if (ratio < 0.5) return { label: 'Kritik', color: 'bg-red-100 text-red-700 border-0' };
    if (ratio < 1) return { label: 'Düşük', color: 'bg-amber-100 text-amber-700 border-0' };
    return { label: 'Yeterli', color: 'bg-green-100 text-green-700 border-0' };
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setFormDialogOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setFormDialogOpen(true);
  };

  const handleFormSubmit = async (data: InventoryFormValues) => {
    try {
      setFormLoading(true);
      if (editingItem) {
        const response = await inventoryService.update(editingItem.id, data);
        if (response.success) {
          toast.success('Ekipman güncellendi');
          setFormDialogOpen(false);
          await loadInventory();
        } else {
          toast.error(response.error || 'Güncelleme başarısız');
        }
      } else {
        const response = await inventoryService.create(data);
        if (response.success) {
          toast.success('Ekipman eklendi');
          setFormDialogOpen(false);
          await loadInventory();
        } else {
          toast.error(response.error || 'Ekleme başarısız');
        }
      }
    } catch (error: any) {
      console.error('Error saving inventory:', error);
      toast.error(error?.message || 'Bir hata oluştu');
    } finally {
      setFormLoading(false);
    }
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
        <Button 
          onClick={handleAddClick}
          className="gap-2 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 text-sm w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Yeni Ekipman Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Ürün Tipi"
          value={inventory.length}
          icon={Package}
          index={0}
        />
        <StatsCard
          title="Toplam Stok"
          value={totalItems}
          icon={Package}
          index={1}
        />
        <StatsCard
          title="Düşük Stok"
          value={lowStockItems.length}
          icon={AlertTriangle}
          index={2}
        />
        <StatsCard
          title="Kategoriler"
          value={categories.length - 1}
          icon={Package}
          index={3}
        />
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
      {loading ? (
        <div className="text-center py-12 text-gray-400">Yükleniyor...</div>
      ) : filteredInventory.length === 0 ? (
        <Card className="bg-white border-green-100 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">Envanter bulunamadı</p>
          </CardContent>
        </Card>
      ) : (
        <div className="block lg:hidden space-y-3">
          {filteredInventory.map((item) => {
            const status = getStockStatus(item);
            return (
              <Card key={item.id} className="bg-white border-green-100 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.description || 'Açıklama yok'}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">{item.category || 'Diğer'}</Badge>
                        <Badge className={`${status.color} text-[10px]`}>{status.label}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-gray-800">{item.quantity || 0}</p>
                      <p className="text-[10px] text-gray-400">min: {item.min_stock || 0}</p>
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
                        <DropdownMenuItem 
                          className="cursor-pointer text-sm"
                          onClick={() => handleEditClick(item)}
                        >
                          <Edit className="h-4 w-4 mr-2 text-gray-400" />
                          Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-green-100" />
                        <DropdownMenuItem 
                          className="text-red-500 hover:bg-red-50 cursor-pointer text-sm"
                          onClick={async () => {
                            if (confirm('Bu ekipmanı silmek istediğinize emin misiniz?')) {
                              try {
                                const response = await inventoryService.delete(item.id);
                                if (response.success) {
                                  toast.success('Ekipman silindi');
                                  await loadInventory();
                                } else {
                                  toast.error(response.error || 'Silme başarısız');
                                }
                              } catch (error: any) {
                                console.error('Error deleting inventory:', error);
                                toast.error(error?.message || 'Bir hata oluştu');
                              }
                            }
                          }}
                        >
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
      )}

      {/* Inventory Table - Desktop */}
      {!loading && (
        <Card className="hidden lg:block bg-white border-green-100 shadow-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-gray-900">Envanter Listesi</CardTitle>
            <CardDescription className="text-gray-400">
              Tüm ekipman ve malzemelerin stok durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Envanter bulunamadı</div>
            ) : (
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
                        <p className="text-xs text-gray-400">{item.description || 'Açıklama yok'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 border-0">{item.category || 'Diğer'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-lg text-gray-800">{item.quantity || 0}</span>
                    </TableCell>
                    <TableCell className="text-center text-gray-400">{item.min_stock || 0}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {item.updated_at ? new Date(item.updated_at).toLocaleDateString('tr-TR') : '-'}
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
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleEditClick(item)}
                          >
                            <Edit className="h-4 w-4 mr-2 text-gray-400" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500 hover:bg-red-50 cursor-pointer"
                            onClick={async () => {
                              if (confirm('Bu ekipmanı silmek istediğinize emin misiniz?')) {
                                try {
                                  const response = await inventoryService.delete(item.id);
                                  if (response.success) {
                                    toast.success('Ekipman silindi');
                                    await loadInventory();
                                  } else {
                                    toast.error(response.error || 'Silme başarısız');
                                  }
                                } catch (error: any) {
                                  console.error('Error deleting inventory:', error);
                                  toast.error(error?.message || 'Bir hata oluştu');
                                }
                              }
                            }}
                          >
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Inventory Form Dialog */}
      <InventoryFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        item={editingItem}
        loading={formLoading}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
