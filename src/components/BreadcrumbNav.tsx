import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";

interface BreadcrumbNavProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator />
            {item.href ? (
              <Link to={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};