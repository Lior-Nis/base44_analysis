
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, User, Plus, AlertCircle, Send, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MondayDashboard() {
  const [boardId, setBoardId] = useState("");
  const [boardData, setBoardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);

  // Try to get boardId from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlBoardId = urlParams.get('boardId');
    if (urlBoardId) {
      setBoardId(urlBoardId);
      fetchBoardData(urlBoardId);
    }
  }, []);

  const fetchBoardData = async (id = boardId) => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/functions/monday_board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: parseInt(id) })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      if (data.data?.boards?.[0]) {
        setBoardData(data.data.boards[0]);
      } else if (data.errors) {
        throw new Error(data.errors[0]?.message || "Failed to fetch board data");
      } else {
        throw new Error("No board data found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createNewItem = async () => {
    if (!newItemName.trim() || !boardId) return;
    
    setCreatingItem(true);
    setError(null);
    setNotification(null);

    try {
      const mondayResponse = await fetch('/api/functions/monday_create_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId: parseInt(boardId), itemName: newItemName.trim() })
      });

      if (!mondayResponse.ok) throw new Error(`Failed to create item. Status: ${mondayResponse.status}`);
      const mondayData = await mondayResponse.json();
      if (mondayData.errors) throw new Error(mondayData.errors[0]?.message || "Failed to create item");
      
      // Send Slack notification using the imported function
      try {
        const slackMessage = `🚀 New item created in Monday board "${boardData?.name}": *${newItemName.trim()}*`;
        const { send_slack_notification } = await import('@/api/functions');
        await send_slack_notification({ message: slackMessage });
        setNotification('Item created and Slack notification sent successfully!');
      } catch (slackError) {
        setNotification('Item created, but failed to send Slack notification.');  
      }

      setNewItemName("");
      await fetchBoardData(); // Refresh board data

    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingItem(false);
    }
  };

  const getColumnTypeColor = (type) => {
    const colors = {
      text: "bg-blue-100 text-blue-800",
      status: "bg-green-100 text-green-800",
      date: "bg-purple-100 text-purple-800",
      people: "bg-orange-100 text-orange-800",
      numbers: "bg-yellow-100 text-yellow-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monday.com Dashboard</h1>
          <p className="text-gray-600">View your Monday.com board and send Slack notifications on new items.</p>
        </div>

        {/* Board ID Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Board Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter your Monday.com Board ID"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => fetchBoardData()} 
                disabled={!boardId || loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Load Board"}
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              You can find your Board ID in the Monday.com URL when viewing your board
            </p>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {notification && (
            <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{notification}</AlertDescription>
            </Alert>
        )}

        {boardData && (
          <div className="space-y-6">
            {/* Board Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{boardData.name}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  {boardData.columns?.map((column) => (
                    <Badge key={column.id} className={getColumnTypeColor(column.type)}>
                      {column.title} ({column.type})
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>

            {/* Create New Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Item & Notify Slack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter item name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewItem()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={createNewItem} 
                    disabled={!newItemName.trim() || creatingItem}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  >
                    {creatingItem ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Create & Notify
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Board Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Board Items ({boardData.items_page?.items?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {boardData.items_page?.items?.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3">{item.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {item.column_values?.map((columnValue, index) => (
                          columnValue.column?.title && columnValue.text && (
                            <div key={index} className="bg-white rounded p-3">
                              <p className="text-sm text-gray-500 font-medium">{columnValue.column.title}</p>
                              <p className="text-gray-900 mt-1">{columnValue.text}</p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {(!boardData.items_page?.items || boardData.items_page.items.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No items found in this board</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
