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
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbSeparator />
            {item.href ? (
              <BreadcrumbLink as={Link} to={item.href}>
                {item.label}
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};