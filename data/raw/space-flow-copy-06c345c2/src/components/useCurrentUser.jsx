
import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Employee } from '@/api/entities';
import { isEqual } from 'lodash';

export function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState(null);
    const [isImpersonating, setIsImpersonating] = useState(false);
    const [impersonatedEmployee, setImpersonatedEmployee] = useState(null);
    const [realUser, setRealUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                let loggedInUser = await User.me();
                setRealUser(loggedInUser);

                // Check if this is a first-time user
                const hasSeenWalkthrough = localStorage.getItem(`walkthrough_completed_${loggedInUser.email}`);
                setIsFirstTimeUser(!hasSeenWalkthrough);

                // Only sync employee data if user exists
                if (loggedInUser?.email) {
                    try {
                        const userEmployees = await Employee.filter({ email: loggedInUser.email });
                        let employeeRecord;
                        
                        if (userEmployees.length === 0) {
                            // Only create if no employee exists with this email
                            employeeRecord = await Employee.create({
                                name: loggedInUser.full_name,
                                email: loggedInUser.email,
                                active: true,
                                department: loggedInUser.department || '',
                                work_days: [],
                            });
                        } else {
                            employeeRecord = userEmployees[0];
                        }
                        
                        // --- Start Sync Logic ---
                        const userUpdates = {};
                        const employeeUpdates = {};

                        // 1. Sync name from User -> Employee
                        if (employeeRecord.name !== loggedInUser.full_name) {
                            employeeUpdates.name = loggedInUser.full_name;
                        }

                        // 2. Sync department from Employee -> User
                        const employeeDepartment = employeeRecord.department || '';
                        if (loggedInUser.department !== employeeDepartment) {
                            userUpdates.department = employeeDepartment;
                        }

                        // 3. Sync assigned_location_id from Employee -> User
                        const employeeLocationId = employeeRecord.assigned_location_id || null;
                        if (loggedInUser.assigned_location_id !== employeeLocationId) {
                            userUpdates.assigned_location_id = employeeLocationId;
                        }

                        // 4. Derive and sync work schedule from Employee -> User
                        const workDays = employeeRecord.work_days || [];
                        const derivedWorkSchedule = {
                            sunday: workDays.includes('sunday') ? 'office' : 'remote',
                            monday: workDays.includes('monday') ? 'office' : 'remote',
                            tuesday: workDays.includes('tuesday') ? 'office' : 'remote',
                            wednesday: workDays.includes('wednesday') ? 'office' : 'remote',
                            thursday: workDays.includes('thursday') ? 'office' : 'remote',
                        };

                        // Ensure currentWorkSchedule is an object for comparison
                        const currentWorkSchedule = loggedInUser.work_schedule || {};

                        if (!isEqual(currentWorkSchedule, derivedWorkSchedule)) {
                            userUpdates.work_schedule = derivedWorkSchedule;
                        }

                        // Perform updates if anything has changed
                        if (Object.keys(employeeUpdates).length > 0) {
                            console.log('Syncing User to Employee:', employeeUpdates);
                            await Employee.update(employeeRecord.id, employeeUpdates);
                        }
                        if (Object.keys(userUpdates).length > 0) {
                            console.log('Syncing Employee to User:', userUpdates);
                            await User.update(loggedInUser.id, userUpdates);
                            // Refresh user object after update
                            const updatedUser = await User.me();
                            setRealUser(updatedUser);
                            loggedInUser = updatedUser; // Use updated user for impersonation check
                        }
                        // --- End Sync Logic ---

                    } catch (syncError) {
                        console.warn('Employee/User sync failed, will retry on next login:', syncError);
                    }
                }

                const impersonatedEmployeeId = sessionStorage.getItem('impersonatedEmployeeId');

                if (impersonatedEmployeeId && loggedInUser.role === 'admin') {
                    const allEmployees = await Employee.list();
                    const employee = allEmployees.find(e => e.id === impersonatedEmployeeId);
                    
                    if (employee) {
                        const users = await User.filter({ email: employee.email });
                        if (users.length > 0) {
                            setCurrentUser(users[0]);
                            setImpersonatedEmployee(employee);
                            setIsImpersonating(true);
                        } else {
                            setCurrentUser(loggedInUser);
                        }
                    } else {
                       sessionStorage.removeItem('impersonatedEmployeeId');
                       setCurrentUser(loggedInUser);
                    }
                } else {
                    setCurrentUser(loggedInUser);
                    setIsImpersonating(false);
                }
            } catch (error) {
                console.error("Error in useCurrentUser:", error);
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const markWalkthroughComplete = () => {
        if (realUser?.email) {
            localStorage.setItem(`walkthrough_completed_${realUser.email}`, 'true');
            setIsFirstTimeUser(false);
        }
    };

    const resetWalkthrough = () => {
        if (realUser?.email) {
            localStorage.removeItem(`walkthrough_completed_${realUser.email}`);
            setIsFirstTimeUser(true);
        }
    };

    return { 
        user: currentUser, 
        isImpersonating, 
        impersonatedEmployee, 
        realUser, 
        loading,
        isFirstTimeUser,
        markWalkthroughComplete,
        resetWalkthrough
    };
}
