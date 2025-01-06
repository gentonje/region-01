import { Badge } from "@/components/ui/badge";

interface ProductModifyHeaderProps {
  title: string;
  ownerName: string;
}

export const ProductModifyHeader = ({ title, ownerName }: ProductModifyHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Badge variant="secondary" className="ml-2">
        {ownerName}
      </Badge>
    </div>
  );
};