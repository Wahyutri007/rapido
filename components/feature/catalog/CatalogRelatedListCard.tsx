import React from "react";
import Card from "@/components/common/Card";
import Text from "@/components/common/Text";
import CatalogDetailSection from "./CatalogDetailSection";

export type CatalogRelatedListCardProps<T> = {
	title: string;
	items: T[];
	renderItem: (item: T, index: number, isLast: boolean) => React.ReactNode;
	emptyText?: string;
	className?: string;
	cardClassName?: string;
};

export default function CatalogRelatedListCard<T>({
	title,
	items,
	renderItem,
	emptyText = "Belum ada item yang terhubung",
	className,
	cardClassName,
}: CatalogRelatedListCardProps<T>) {
	return (
		<CatalogDetailSection
			title={title}
			className={className}
			cardClassName={cardClassName}
		>
			{items && items.length > 0 ? (
				items.map((item, index) =>
					renderItem(item, index, index === items.length - 1),
				)
			) : (
				<Text size="small" className="py-3.5 text-center text-muted">
					{emptyText}
				</Text>
			)}
		</CatalogDetailSection>
	);
}
