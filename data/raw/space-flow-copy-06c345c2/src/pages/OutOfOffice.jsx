import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Filter, Plus } from "lucide-react";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

import { OutOfOffice } from "@/api/entities";
import { Employee } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";
import OutOfOfficeSection from "../components/profile/OutOfOfficeSection";

export default function OutOfOfficePage() {
  const [outOfOfficeEntries, setOutOfOfficeEntries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const { user: realUser, loading: userLoading } = useCurrentUser();
  const [dataLoading, setDataLoading] = useState(true);

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterEmployee, setFilterEmployee] = useState('all');
  const [filterReason, setFilterReason] = useState('all');

  useEffect(() => {
    if (!userLoading) {
      loadData();
    }
  }, [userLoading]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [allOutOfOffice, allEmployees] = await Promise.all([
      OutOfOffice.list('-start_date'),
      Employee.list()]
      );

      setOutOfOfficeEntries(allOutOfOffice);
      setEmployees(allEmployees);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setDataLoading(false);
  };

  const filteredEntries = outOfOfficeEntries.filter((entry) => {
    const startDate = parseISO(entry.start_date);
    const endDate = parseISO(entry.end_date);
    const monthStart = startOfMonth(parseISO(`${selectedMonth}-01`));
    const monthEnd = endOfMonth(parseISO(`${selectedMonth}-01`));

    // Check if entry overlaps with selected month
    const overlapsMonth = startDate <= monthEnd && endDate >= monthStart;
    if (!overlapsMonth) return false;

    // Filter by employee
    if (filterEmployee !== 'all' && entry.employee_email !== filterEmployee) return false;

    // Filter by reason
    if (filterReason !== 'all' && entry.reason !== filterReason) return false;

    return true;
  });

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-48 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>);

  }

  if (realUser?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to view all out of office entries.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>);

  }

  return (
    <div className="p-6 md:p-8 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Out of Office Management</h1>
          <p className="text-slate-600 mt-1">
            View and manage employee out of office periods.
          </p>
        </div>

        {/* Filters */}
        <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)} className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/80 backdrop-blur-sm border-slate-200" />


              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="Filter by employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map((employee) =>
                    <SelectItem key={employee.email} value={employee.email}>
                        {employee.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <Select value={filterReason} onValueChange={setFilterReason}>
                  <SelectTrigger className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/80 backdrop-blur-sm border-slate-200">
                    <SelectValue placeholder="Filter by reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick_leave">Sick Leave</SelectItem>
                    <SelectItem value="business_trip">Business Trip</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total This Month</p>
                  <p className="text-2xl font-bold text-slate-900">{filteredEntries.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Currently Out</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {outOfOfficeEntries.filter((entry) => {
                      const today = new Date();
                      return isWithinInterval(today, {
                        start: parseISO(entry.start_date),
                        end: parseISO(entry.end_date)
                      }) && entry.status === 'approved';
                    }).length}
                  </p>
                </div>
                <Users className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {outOfOfficeEntries.filter((entry) => {
                      const start = parseISO(entry.start_date);
                      const today = new Date();
                      return start > today && entry.status === 'approved';
                    }).length}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Out of Office Management */}
        <OutOfOfficeSection
          userEmail="" // Empty for admin view (shows all)
          isReadOnly={false}
          isAdmin={true} />

      </div>
    </div>);

}