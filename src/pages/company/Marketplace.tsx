import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getListings } from '@/services/marketplace';
import { LandParcelCard } from '@/components/LandParcelCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const INDIAN_STATES = ['All States','Andhra Pradesh','Assam','Chhattisgarh','Goa','Gujarat','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Odisha','Rajasthan','Sikkim','Tamil Nadu','Telangana','Uttarakhand','Uttar Pradesh','West Bengal'];

export default function Marketplace() {
  const [landType, setLandType] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState([500, 1100]);
  const [sortBy, setSortBy] = useState('price_asc');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  // Map frontend filter values to API values
  const filters = {
    ...(landType !== 'all' ? { land_type: landType.toLowerCase() } : {}),
    ...(stateFilter !== 'all' ? { state: stateFilter } : {}),
    min_price: priceRange[0],
    max_price: priceRange[1],
    sort: sortBy,
    page,
    limit: 9,
    ...(search ? { search } : {}),
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => getListings(filters),
    placeholderData: (prev) => prev,
  });

  const listings = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  // Map API response to the shape LandParcelCard expects (Project Schema)
  const mappedListings = listings.map((l: any) => ({
    project_id: l.land_id,
    project_name: `Carbon Offset Project - ${l.district}`,
    region: `${l.district}, ${l.state}`,
    project_type: l.land_type.charAt(0).toUpperCase() + l.land_type.slice(1),
    plantation_type: Array.isArray(l.permitted_species) ? l.permitted_species.join(', ') : 'Mixed Vegetation',
    area_hectare: parseFloat(l.area_hectares),
    carbon_credits_available: l.credits_available,
    carbon_credits_generated: l.total_credits_generated,
    price_per_credit: parseFloat(l.price_per_credit),
    vintage_year: new Date(l.created_at || Date.now()).getFullYear() - 1,
    duration_years: 10,
    verification_status: l.status === 'active' ? 'Govt Verified' : 'Pending Review',
    description: `A government-certified carbon offset project located in ${l.district}, ${l.state}, focusing on sustainable ${l.land_type} conservation and management.`,
  }));

  const FilterContent = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Land Type</Label>
        <Select value={landType} onValueChange={(v) => { setLandType(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="All Types" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Forest">Forest</SelectItem>
            <SelectItem value="Agricultural">Agricultural</SelectItem>
            <SelectItem value="Wetland">Wetland</SelectItem>
            <SelectItem value="Grassland">Grassland</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">State</Label>
        <Select value={stateFilter} onValueChange={(v) => { setStateFilter(v); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
          <SelectContent>
            {INDIAN_STATES.map(s => <SelectItem key={s} value={s === 'All States' ? 'all' : s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Price Range: ₹{priceRange[0]} – ₹{priceRange[1]}</Label>
        <Slider min={500} max={1100} step={10} value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }} />
      </div>
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Sort By</Label>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1); }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="price_asc">Price (Low to High)</SelectItem>
            <SelectItem value="price_desc">Price (High to Low)</SelectItem>
            <SelectItem value="availability">Availability</SelectItem>
            <SelectItem value="area">Land Area</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Carbon Credit Marketplace</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="md:hidden">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4"><FilterContent /></div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:block w-72 shrink-0">
          <div className="bg-card rounded-xl border border-border p-4 sticky top-20">
            <h3 className="text-sm font-semibold text-foreground mb-4">Filters</h3>
            <FilterContent />
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search by ID, state, or district..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              />
            </div>
            <Button size="sm" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
          </div>

          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground">{isLoading ? 'Loading...' : `${total} verified projects found`}</p>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>

          {isError && (
            <div className="text-center py-16">
              <p className="text-destructive">Failed to load listings. Is the backend running?</p>
            </div>
          )}

          {!isLoading && !isError && mappedListings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mappedListings.map((p: any) => <LandParcelCard key={p.project_id} parcel={p} />)}
            </div>
          ) : !isLoading && !isError ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No verified projects match your filters.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setLandType('all'); setStateFilter('all'); setPriceRange([500, 1100]); setSearch(''); setSearchInput(''); }}>
                Clear Filters
              </Button>
            </div>
          ) : null}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
