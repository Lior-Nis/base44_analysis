import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Location } from '@/api/entities';
import { Floor } from '@/api/entities';
import { Zone } from '@/api/entities';
import { Workspace } from '@/api/entities';
import { Employee } from '@/api/entities';
import { Booking } from '@/api/entities';
import { OutOfOffice } from '@/api/entities';
import { useCurrentUser } from './useCurrentUser';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    locations: [],
    floors: [],
    zones: [],
    workspaces: [],
    employees: [],
    bookings: [],
    outOfOffice: [],
  });
  const [loading, setLoading] = useState(true);
  const { user, loading: userLoading } = useCurrentUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    console.log("DataProvider: Fetching all application data...");
    try {
      // Using Promise.all for concurrent fetching, which is faster.
      const [
        allLocations,
        allFloors,
        allZones,
        allWorkspaces,
        allEmployees,
        allBookings,
        allOutOfOffice,
      ] = await Promise.all([
        Location.list(),
        Floor.list(),
        Zone.list(),
        Workspace.list(),
        Employee.list(),
        Booking.list('-booking_date'),
        OutOfOffice.list(),
      ]);

      setData({
        locations: allLocations,
        floors: allFloors,
        zones: allZones,
        workspaces: allWorkspaces,
        employees: allEmployees,
        bookings: allBookings,
        outOfOffice: allOutOfOffice,
      });
      console.log("DataProvider: Data fetched successfully.");
    } catch (error) {
      console.error("DataProvider: Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userLoading && user) {
      fetchData();
    }
  }, [user, userLoading, fetchData]);

  const value = {
    ...data,
    loading,
    refreshData: fetchData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};