import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShieldCheck, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandParcelCard({ parcel: project }: { parcel: any }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all border-border flex flex-col bg-card">
      <CardHeader className="pb-3 bg-secondary/40 border-b border-border/50">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> {project.verification_status}
          </Badge>
          <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">{project.project_id}</span>
        </div>
        <CardTitle className="text-lg leading-tight text-foreground">{project.project_name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-5 pb-0 space-y-5 flex-1">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          {project.region}
        </div>
        
        <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-xl border border-border/50">
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Available</p>
            <p className="font-black text-xl text-primary">{(project.carbon_credits_available || 0).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Price/Credit</p>
            <p className="font-bold text-xl text-foreground">₹{project.price_per_credit}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="text-xs text-muted-foreground bg-background">{project.project_type}</Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground bg-background">{(project.area_hectare || 0).toLocaleString()} hectares</Badge>
        </div>
      </CardContent>
      
      <CardFooter className="gap-3 pt-6 pb-5">
        <Button variant="outline" className="flex-1 bg-background" onClick={() => navigate(`/company/marketplace/${project.project_id}`)}>
          View Details
        </Button>
        <Button className="flex-1 shadow-sm" onClick={() => navigate(`/company/marketplace/${project.project_id}?request=true`)}>
          Request Purchase
        </Button>
      </CardFooter>
    </Card>
  );
}
