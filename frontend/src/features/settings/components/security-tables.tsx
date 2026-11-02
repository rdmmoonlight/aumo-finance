"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut } from "lucide-react";

export interface SessionItem {
  id?: string;
  deviceName?: string;
  isCurrent?: boolean;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  country?: string;
  lastActivityAt?: string;
}
export interface ActivityItem {
  id?: string;
  activityType?: string;
  device?: string;
  operatingSystem?: string;
  ipAddress?: string;
  createdAt?: string;
  isSuccess?: boolean;
}

export const formatDate = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleString("id-ID", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

export function ActiveSessionsTable({
  sessions,
  onRevoke,
  isRevoking,
}: {
  sessions: SessionItem[];
  onRevoke: (id?: string, deviceName?: string) => void;
  isRevoking: boolean;
}) {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow className="h-7">
          <TableHead className="text-caption h-7">Device</TableHead>
          <TableHead className="text-caption h-7">Browser/OS</TableHead>
          <TableHead className="text-caption h-7">IP</TableHead>
          <TableHead className="text-caption h-7">Last</TableHead>
          <TableHead className="text-caption h-7 text-right" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((session) => (
          <TableRow key={session.id} className="h-9">
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption font-medium">
                {session.deviceName}
                {session.isCurrent && (
                  <Badge className="ml-1 h-4 text-label-small bg-emerald-500/15 text-emerald-600">
                    Current
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption text-muted-foreground">
                {session.browser}
                <div className="text-caption">{session.operatingSystem}</div>
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 font-mono text-caption">
                {session.ipAddress}
                <div className="text-caption text-muted-foreground">
                  {session.country}
                </div>
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption">
                {session.lastActivityAt
                  ? new Date(session.lastActivityAt).toLocaleTimeString("id-ID")
                  : "-"}
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-right">
                {!session.isCurrent ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 text-caption text-destructive px-2"
                    onClick={() => onRevoke(session.id, session.deviceName)}
                    disabled={isRevoking}
                  >
                    <LogOut size={11} />
                  </Button>
                ) : (
                  <span className="text-caption text-emerald-600">Active</span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function ActivityLogsTable({
  activities,
}: {
  activities: ActivityItem[];
}) {
  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow className="h-7">
          <TableHead className="text-caption h-7">Type</TableHead>
          <TableHead className="text-caption h-7">Device</TableHead>
          <TableHead className="text-caption h-7">IP</TableHead>
          <TableHead className="text-caption h-7">Date</TableHead>
          <TableHead className="text-caption h-7">
            <div className="text-right">Status</div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activities.map((act) => (
          <TableRow key={act.id} className="h-9">
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption">{act.activityType}</div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption text-muted-foreground">
                {act.device}
                <div className="text-caption">{act.operatingSystem}</div>
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 font-mono text-caption">
                {act.ipAddress}
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-caption">
                {formatDate(act.createdAt)}
              </div>
            </TableCell>
            <TableCell className="p-0 px-4">
              <div className="py-1.5 text-right">
                {act.isSuccess ? (
                  <Badge className="h-4 text-label-small bg-emerald-500/15 text-emerald-600">
                    OK
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="h-4 text-label-small">
                    Fail
                  </Badge>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
