
import React, { useState, useEffect } from "react";
import { Board } from "@/api/entities";
import { Item } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  // MoreHorizontal, // Removed as it's no longer directly used here for panel controls
  ArrowLeft,
  SortAsc,
  Eye,
  EyeOff,
  Group as GroupIcon,
  Columns
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

import BoardHeader from "../components/board/BoardHeader";
import GroupSection from "../components/board/GroupSection";
import NewTaskModal from "../components/board/NewTaskModal";
import FilterPanel from "../components/board/FilterPanel";
import SortMenu from "../components/board/SortMenu";
import PersonFilter from "../components/board/PersonFilter";
import HideMenu from "../components/board/HideMenu";
import GroupByMenu from "../components/board/GroupByMenu";
import NewColumnModal from "../components/board/NewColumnModal";
import NewGroupModal from "../components/board/NewGroupModal";
import KanbanView from "../components/board/views/KanbanView";
import CalendarView from "../components/board/views/CalendarView";
import TimelineView from "../components/board/views/TimelineView";

import AnalyticsPanel from "../components/board/analytics/AnalyticsPanel";
import IntegrationsPanel from "../components/board/integrations/IntegrationsPanel";
import AutomationsPanel from "../components/board/automations/AutomationsPanel";

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default function BoardPage() {
  const [searchParams] = useSearchParams();
  const boardId = searchParams.get('id');
  
  const [board, setBoard] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [currentView, setCurrentView] = useState('table');
  
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showPersonFilter, setShowPersonFilter] = useState(false);
  const [showHideMenu, setShowHideMenu] = useState(false);
  const [showGroupByMenu, setShowGroupByMenu] = useState(false);
  const [showNewColumnModal, setShowNewColumnModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showAutomations, setShowAutomations] = useState(false);
  
  const [filters, setFilters] = useState({
    status: [],
    people: [],
    priority: []
  });
  const [sortBy, setSortBy] = useState('order_index');
  const [sortDirection, setSortDirection] = useState('asc');
  const [hiddenColumns, setHiddenColumns] = useState(new Set());
  const [groupBy, setGroupBy] = useState('group');

  useEffect(() => {
    if (boardId) {
      loadBoardAndItems();
    }
  }, [boardId]);

  const loadBoardAndItems = async () => {
    setIsLoading(true);
    try {
      const boardDataPromise = Board.filter({ id: boardId });
      const itemsDataPromise = Item.filter({ board_id: boardId }, "order_index");
      
      const [boardResponse, itemsData] = await Promise.all([boardDataPromise, itemsDataPromise]);
      
      if (boardResponse.length > 0) {
        setBoard(boardResponse[0]);
      } else {
        setBoard(null);
      }
      setItems(itemsData);
    } catch (error) {
      console.error("Error loading board and items:", error);
      setBoard(null);
    }
    setIsLoading(false);
  };

  const handleAddItem = async (groupId, title) => {
    if (!boardId || !board) return;

    const maxOrder = Math.max(
      0,
      ...items.filter(item => item.group_id === groupId).map(item => item.order_index || 0)
    );

    const newItemData = {};
    if (board.columns) {
      board.columns.forEach(column => {
        if (column.id === 'task') return;

        switch (column.type) {
          case 'text':
            newItemData[column.id] = "";
            break;
          case 'status':
            newItemData[column.id] = column.options?.choices?.[0]?.label || null;
            break;
          case 'date':
            newItemData[column.id] = null;
            break;
          case 'people':
            newItemData[column.id] = null;
            break;
          case 'number':
            newItemData[column.id] = null;
            break;
          case 'tags':
            newItemData[column.id] = [];
            break;
          case 'checkbox':
            newItemData[column.id] = false;
            break;
          case 'dropdown':
            newItemData[column.id] = column.options?.choices?.[0]?.value || null;
            break;
          case 'priority':
             newItemData[column.id] = column.options?.choices?.[0]?.value || null;
            break;
          default:
            newItemData[column.id] = null;
        }
      });
    }
    
    try {
      const newItem = await Item.create({
        board_id: boardId,
        group_id: groupId,
        title: title,
        order_index: maxOrder + 1,
        data: newItemData
      });
      setItems(prev => [...prev, newItem].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)));
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      await Item.update(itemId, updates);
      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
      // If items are updated, reload them to refresh panels if visible
      if (showAnalytics || showIntegrations || showAutomations) {
        loadBoardAndItems();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await Item.delete(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
       if (showAnalytics || showIntegrations || showAutomations) {
        loadBoardAndItems();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleReorderItems = async (groupId, sourceIndex, destinationIndex) => {
    const groupItems = items.filter(item => item.group_id === groupId).sort((a,b) => (a.order_index || 0) - (b.order_index || 0));
    
    if (sourceIndex < 0 || sourceIndex >= groupItems.length ||
        destinationIndex < 0 || destinationIndex >= groupItems.length) {
      console.warn("Invalid indices for reordering items.");
      return;
    }

    const [reorderedItem] = groupItems.splice(sourceIndex, 1);
    groupItems.splice(destinationIndex, 0, reorderedItem);

    const updates = groupItems.map((item, index) => ({
      ...item,
      order_index: index
    }));

    setItems(prev => {
      const otherItems = prev.filter(item => item.group_id !== groupId);
      return [...otherItems, ...updates].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    });

    try {
      await Promise.all(updates.map(item => 
        Item.update(item.id, { order_index: item.order_index })
      ));
    } catch (error) {
      console.error("Error reordering items:", error);
      loadBoardAndItems();
    }
  };

  const handleAddColumn = async (columnData) => {
    if (!board) return;
    const newColumn = { ...columnData, id: generateId(), width: columnData.width || 150 };
    const updatedColumns = [...(board.columns || []), newColumn];
    
    // Also update all groups to include the new column in their visible_columns
    const updatedGroups = (board.groups || []).map(group => {
      const currentVisibleColumns = group.visible_columns || board.columns?.map(col => col.id) || [];
      return {
        ...group,
        visible_columns: [...currentVisibleColumns, newColumn.id]
      };
    });

    try {
      await Board.update(board.id, { 
        columns: updatedColumns,
        groups: updatedGroups 
      });
      setBoard(prev => ({ 
        ...prev, 
        columns: updatedColumns,
        groups: updatedGroups 
      }));
      setShowNewColumnModal(false);
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleUpdateColumn = async (columnId, updatedData) => {
    if (!board) return;
    const updatedColumns = board.columns.map(col => 
      col.id === columnId ? { ...col, ...updatedData } : col
    );
    try {
      await Board.update(board.id, { columns: updatedColumns });
      setBoard(prev => ({ ...prev, columns: updatedColumns }));
    } catch (error) {
      console.error("Error updating column:", error);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    if (!board) return;
    const updatedColumns = board.columns.filter(col => col.id !== columnId);
    const updatedItems = items.map(item => {
      const newData = { ...item.data };
      delete newData[columnId];
      return { ...item, data: newData };
    });

    try {
      await Board.update(board.id, { columns: updatedColumns });
      setBoard(prev => ({ ...prev, columns: updatedColumns }));
      setItems(updatedItems);
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };
  
  const handleAddGroup = async (groupData) => {
    if (!board) return;
    const newGroup = { ...groupData, id: generateId(), collapsed: false };
    const updatedGroups = [...(board.groups || []), newGroup];
    try {
      await Board.update(board.id, { groups: updatedGroups });
      setBoard(prev => ({ ...prev, groups: updatedGroups }));
      setShowNewGroupModal(false);
    } catch (error) {
      console.error("Error adding group:", error);
    }
  };

  const handleDeleteGroup = async (groupIdToDelete) => {
    if (!board) return;

    if (!window.confirm("Are you sure you want to delete this group and all its tasks? This action cannot be undone.")) {
      return;
    }

    const updatedGroups = board.groups.filter(group => group.id !== groupIdToDelete);
    const itemsOfDeletedGroup = items.filter(item => item.group_id === groupIdToDelete);
    const itemDeletePromises = itemsOfDeletedGroup.map(item => Item.delete(item.id));

    try {
      await Board.update(board.id, { groups: updatedGroups });
      await Promise.all(itemDeletePromises);
      setBoard(prevBoard => ({ ...prevBoard, groups: updatedGroups }));
      setItems(prevItems => prevItems.filter(item => item.group_id !== groupIdToDelete));
      console.log(`Group ${groupIdToDelete} and its items deleted successfully.`);
    } catch (error) {
      console.error("Error deleting group:", error);
      loadBoardAndItems();
    }
  };

  const handleHideColumnFromGroup = async (groupId, columnId) => {
    if (!board) return;
    
    const updatedGroups = board.groups.map(group => {
      if (group.id === groupId) {
        const currentVisibleColumns = group.visible_columns || board.columns.map(col => col.id);
        const newVisibleColumns = currentVisibleColumns.filter(id => id !== columnId);
        return { ...group, visible_columns: newVisibleColumns };
      }
      return group;
    });

    try {
      await Board.update(board.id, { groups: updatedGroups });
      setBoard(prev => ({ ...prev, groups: updatedGroups }));
    } catch (error) {
      console.error("Error hiding column from group:", error);
    }
  };

  const handleViewChange = (newView) => {
    setCurrentView(newView);
  };

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.status.length > 0 && !filters.status.includes(item.data?.status)) {
      return false;
    }
    if (filters.people.length > 0 && !filters.people.includes(item.data?.owner)) {
      return false;
    }
    if (filters.priority.length > 0 && !filters.priority.includes(item.data?.priority)) {
      return false;
    }
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue = a[sortBy] || a.data?.[sortBy] || '';
    let bValue = b[sortBy] || b.data?.[sortBy] || '';
    
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';
    
    if (sortDirection === 'desc') {
      [aValue, bValue] = [bValue, aValue];
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
    } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }
  });

  const groupedItems = board?.groups?.reduce((acc, group) => {
    acc[group.id] = sortedItems.filter(item => item.group_id === group.id);
    return acc;
  }, {}) || {};

  const visibleColumns = (board?.columns || []).filter(col => !hiddenColumns?.has(col.id));

  if (isLoading && !board) {
    return (
      <div className="p-8 bg-[#F5F6F8] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0073EA] mx-auto mb-4"></div>
          <p className="text-lg text-[#323338]">Loading board...</p>
        </div>
      </div>
    );
  }
  
  if (!board) {
    return (
      <div className="p-8 bg-[#F5F6F8] min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-[#323338] mb-4">Board not found</h2>
            <Link to={createPageUrl("Boards")}>
              <Button className="bg-[#0073EA] hover:bg-[#0056B3] text-white rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Boards
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentSelectedCount = selectedItems?.size || 0;
  const numHiddenColumns = hiddenColumns?.size || 0;

  return (
    <div className="bg-[#F5F6F8] min-h-screen">
      <div className="max-w-full">
        <div className="sticky top-0 z-20 bg-[#F5F6F8] pb-4">
          <BoardHeader 
            board={board}
            items={items}
            itemsCount={items.length}
            selectedCount={currentSelectedCount}
            currentView={currentView}
            onViewChange={handleViewChange}
            onShowAnalytics={() => setShowAnalytics(true)}
            onShowIntegrations={() => setShowIntegrations(true)}
            onShowAutomations={() => setShowAutomations(true)}
          />
        </div>

        <div className="px-6 py-6">
          {currentView === 'table' && (
            <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-[#E1E5F3]">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => setShowNewTaskModal(true)}
                  className="bg-[#0073EA] hover:bg-[#0056B3] text-white rounded-lg h-10 px-4 font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Task
                </Button>
                
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676879]" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64 bg-[#F5F6F8] border-none rounded-lg h-10 focus:bg-white focus:ring-2 focus:ring-[#0073EA]/20"
                  />
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 px-4 border-[#E1E5F3]"
                    onClick={() => setShowPersonFilter(!showPersonFilter)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Person
                    {filters.people.length > 0 && (
                      <Badge className="ml-2 bg-[#0073EA] text-white rounded-full w-5 h-5 text-xs p-0 flex items-center justify-center">
                        {filters.people.length}
                      </Badge>
                    )}
                  </Button>
                  {showPersonFilter && (
                    <PersonFilter
                      items={items}
                      selectedPeople={filters.people}
                      onChange={(people) => setFilters(prev => ({ ...prev, people }))}
                      onClose={() => setShowPersonFilter(false)}
                    />
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 px-4 border-[#E1E5F3]"
                    onClick={() => setShowFilterPanel(!showFilterPanel)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                    {(filters.status.length + (filters.priority?.length || 0)) > 0 && (
                      <Badge className="ml-2 bg-[#0073EA] text-white rounded-full w-5 h-5 text-xs p-0 flex items-center justify-center">
                        {filters.status.length + (filters.priority?.length || 0)}
                      </Badge>
                    )}
                  </Button>
                  {showFilterPanel && (
                    <FilterPanel
                      filters={filters}
                      onChange={setFilters}
                      onClose={() => setShowFilterPanel(false)}
                      board={board}
                    />
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 px-4 border-[#E1E5F3]"
                    onClick={() => setShowSortMenu(!showSortMenu)}
                  >
                    <SortAsc className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                  {showSortMenu && (
                    <SortMenu
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      columns={board.columns}
                      onChange={(field, direction) => {
                        setSortBy(field);
                        setSortDirection(direction);
                      }}
                      onClose={() => setShowSortMenu(false)}
                    />
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 px-4 border-[#E1E5F3]"
                    onClick={() => setShowHideMenu(!showHideMenu)}
                  >
                    {numHiddenColumns > 0 ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    Hide
                    {numHiddenColumns > 0 && (
                      <Badge className="ml-2 bg-[#0073EA] text-white rounded-full w-5 h-5 text-xs p-0 flex items-center justify-center">
                        {numHiddenColumns}
                      </Badge>
                    )}
                  </Button>
                  {showHideMenu && (
                    <HideMenu
                      columns={board.columns}
                      hiddenColumns={hiddenColumns}
                      onChange={setHiddenColumns}
                      onClose={() => setShowHideMenu(false)}
                    />
                  )}
                </div>
                
                <div className="relative">
                  <Button 
                    variant="outline" 
                    className="rounded-lg h-10 px-4 border-[#E1E5F3]"
                    onClick={() => setShowGroupByMenu(!showGroupByMenu)}
                  >
                    <GroupIcon className="w-4 h-4 mr-2" />
                    Group by
                  </Button>
                  {showGroupByMenu && (
                    <GroupByMenu
                      groupBy={groupBy}
                      columns={board.columns}
                      onChange={setGroupBy}
                      onClose={() => setShowGroupByMenu(false)}
                    />
                  )}
                </div>
              </div>
              
              {/* Removed MoreHorizontal button from here */}
            </div>
          )}

          {currentView === 'table' && (
            <div className="bg-white rounded-xl shadow-sm border border-[#E1E5F3] overflow-hidden">
              {board.groups?.map((group) => (
                <GroupSection
                  key={group.id}
                  group={group}
                  items={groupedItems[group.id] || []}
                  columns={visibleColumns}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem} 
                  onReorderItems={handleReorderItems} 
                  onUpdateColumn={handleUpdateColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onAddColumn={() => setShowNewColumnModal(true)}
                  isLoading={isLoading && items.length === 0}
                  selectedItems={selectedItems}
                  onSelectItem={(itemId, selected) => {
                    const newSelected = new Set(selectedItems || []);
                    if (selected) {
                      newSelected.add(itemId);
                    } else {
                      newSelected.delete(itemId);
                    }
                    setSelectedItems(newSelected);
                  }}
                  onDeleteGroup={handleDeleteGroup}
                  onHideColumnFromGroup={handleHideColumnFromGroup}
                />
              ))}
              {(!board.groups || board.groups.length === 0) && !isLoading && (
                <div className="p-8 text-center text-[#676879]">
                  <h3 className="text-xl font-medium mb-2">No groups yet!</h3>
                  <p className="mb-4">Start by adding your first group to organize your tasks.</p>
                  <Button
                    className="bg-[#0073EA] hover:bg-[#0056B3] text-white rounded-lg h-10 px-4 font-medium"
                    onClick={() => setShowNewGroupModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Group
                  </Button>
                </div>
              )}
              
              <div className="p-4 border-t border-[#E1E5F3]">
                <Button
                  variant="outline"
                  className="w-full border-dashed border-[#0073EA] text-[#0073EA] hover:bg-[#0073EA]/10 rounded-lg h-10"
                  onClick={() => setShowNewGroupModal(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Group
                </Button>
              </div>
            </div>
          )}

          {currentView === 'kanban' && (
            <KanbanView
              board={board}
              items={sortedItems} // Pass sorted items
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onReorderItems={handleReorderItems}
            />
          )}

          {currentView === 'calendar' && (
            <CalendarView
              board={board}
              items={sortedItems} // Pass sorted items
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              board={board}
              items={sortedItems} // Pass sorted items
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
            />
          )}
        </div>

        <NewTaskModal
          isOpen={showNewTaskModal}
          onClose={() => setShowNewTaskModal(false)}
          board={board}
          onSubmit={handleAddItem}
        />
        <NewColumnModal
          isOpen={showNewColumnModal}
          onClose={() => setShowNewColumnModal(false)}
          onSubmit={handleAddColumn}
        />
        <NewGroupModal
          isOpen={showNewGroupModal}
          onClose={() => setShowNewGroupModal(false)}
          onSubmit={handleAddGroup}
        />

        {showAnalytics && (
          <AnalyticsPanel 
            board={board} 
            items={items} // Pass original items, panel will sort/filter if needed
            onClose={() => setShowAnalytics(false)} 
          />
        )}

        {showIntegrations && (
          <IntegrationsPanel board={board} onClose={() => setShowIntegrations(false)} />
        )}

        {showAutomations && (
          <AutomationsPanel 
            board={board} 
            onClose={() => setShowAutomations(false)} 
          />
        )}
      </div>
    </div>
  );
}
