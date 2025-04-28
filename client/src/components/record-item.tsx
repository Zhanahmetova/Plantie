import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { usePlant } from "@/hooks/use-plants";
import { type PlantRecord } from "@shared/schema";
import { LeafIcon } from "@/lib/icons";

interface RecordItemProps {
  record: PlantRecord;
  className?: string;
}

const RecordItem: React.FC<RecordItemProps> = ({ record, className }) => {
  const { data: plant } = usePlant(record.plantId);

  return (
    <Card className={`overflow-hidden rounded-3xl bg-card/60 backdrop-blur-sm ${className}`}>
      <div className="relative">
        <div className="aspect-w-4 aspect-h-3">
          <img
            src={record.image}
            alt={plant?.name || "Plant record"}
            className="object-cover w-full h-full"
          />
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {formatDate(record.recordDate)}
          </div>
        </div>
        
        {plant && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <LeafIcon size={16} />
              {plant.name}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 space-y-2">
        {record.note && (
          <p className="text-sm text-muted-foreground line-clamp-3">{record.note}</p>
        )}
      </div>
    </Card>
  );
};

export default RecordItem;