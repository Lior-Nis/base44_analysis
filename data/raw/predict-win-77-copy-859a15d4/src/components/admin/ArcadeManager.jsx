import React, { useState, useEffect } from "react";
import { SevenUpSevenDownGame, RullotrGame, DragonTigerGame, CarRouletteGame, PlinkoGame, ParityGame, DiceGame, SpinWinGame, ChickenRoadGame, PenaltyGame } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Dices, Disc, Flame, Car, Droplets, GitCompareArrows, RotateCw, Egg, Zap } from "lucide-react";

export default function ArcadeManager() {
    const [sevenUpGames, setSevenUpGames] = useState([]);
    const [rullotrGames, setRullotrGames] = useState([]);
    const [dragonTigerGames, setDragonTigerGames] = useState([]);
    const [carRouletteGames, setCarRouletteGames] = useState([]);
    const [plinkoGames, setPlinkoGames] = useState([]);
    const [parityGames, setParityGames] = useState([]);
    const [diceGames, setDiceGames] = useState([]);
    const [spinWinGames, setSpinWinGames] = useState([]);
    const [chickenRoadGames, setChickenRoadGames] = useState([]);
    const [penaltyGames, setPenaltyGames] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setSevenUpGames(await SevenUpSevenDownGame.filter({ status: "completed" }, "-created_date", 50));
            setRullotrGames(await RullotrGame.filter({ status: "completed" }, "-created_date", 50));
            setDragonTigerGames(await DragonTigerGame.filter({ status: "completed" }, "-created_date", 50));
            setCarRouletteGames(await CarRouletteGame.filter({ status: "completed" }, "-created_date", 50));
            setPlinkoGames(await PlinkoGame.list("-created_date", 50));
            setParityGames(await ParityGame.filter({ status: "completed" }, "-created_date", 50));
            setDiceGames(await DiceGame.filter({ status: "completed" }, "-created_date", 50));
            setSpinWinGames(await SpinWinGame.list("-created_date", 50));
            setChickenRoadGames(await ChickenRoadGame.filter({ status: "completed" }, "-created_date", 50));
            setPenaltyGames(await PenaltyGame.filter({ status: "completed" }, "-created_date", 50));
        }
        fetchData();
    }, []);

    return (
        <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Gamepad2 className="text-cyan-400" />
                    Arcade Game Management
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="7up7down">
                    <TabsList className="grid w-full grid-cols-10 bg-slate-700">
                        <TabsTrigger value="7up7down">7Up 7Down</TabsTrigger>
                        <TabsTrigger value="rullotr">Rullotr</TabsTrigger>
                        <TabsTrigger value="dragontiger">Dragon Tiger</TabsTrigger>
                        <TabsTrigger value="carroulette">Car Roulette</TabsTrigger>
                        <TabsTrigger value="plinko">Plinko</TabsTrigger>
                        <TabsTrigger value="parity">Parity</TabsTrigger>
                        <TabsTrigger value="diceroll">Dice Roll</TabsTrigger>
                        <TabsTrigger value="spintowin">Spin & Win</TabsTrigger>
                        <TabsTrigger value="chickenroad">Chicken Road</TabsTrigger>
                        <TabsTrigger value="penalty">Penalty</TabsTrigger>
                    </TabsList>
                    <TabsContent value="7up7down" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent 7Up 7Down Rounds</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Dice</TableHead><TableHead className="text-white">Sum</TableHead><TableHead className="text-white">Outcome</TableHead></TableRow></TableHeader><TableBody>{sevenUpGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.dice1_result} + {game.dice2_result}</TableCell><TableCell>{game.total_sum}</TableCell><TableCell><Badge>{game.outcome}</Badge></TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="rullotr" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Rullotr Spins</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Winning #</TableHead><TableHead className="text-white">Winning Color</TableHead></TableRow></TableHeader><TableBody>{rullotrGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.winning_number}</TableCell><TableCell><Badge style={{backgroundColor: game.winning_color}}>{game.winning_color}</Badge></TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="dragontiger" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Dragon Tiger Rounds</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Dragon</TableHead><TableHead className="text-white">Tiger</TableHead><TableHead className="text-white">Winner</TableHead></TableRow></TableHeader><TableBody>{dragonTigerGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.dragon_card}</TableCell><TableCell>{game.tiger_card}</TableCell><TableCell><Badge>{game.winning_hand}</Badge></TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="carroulette" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Car Roulette Spins</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Winning Brand</TableHead><TableHead className="text-white">Color</TableHead></TableRow></TableHeader><TableBody>{carRouletteGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.winning_brand}</TableCell><TableCell>{game.winning_color}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="plinko" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Plinko Drops</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">User</TableHead><TableHead className="text-white">Bet</TableHead><TableHead className="text-white">Risk</TableHead><TableHead className="text-white">Multiplier</TableHead><TableHead className="text-white">Win</TableHead></TableRow></TableHeader><TableBody>{plinkoGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.user_id.slice(0,8)}...</TableCell><TableCell>₹{game.bet_amount}</TableCell><TableCell>{game.risk_level}</TableCell><TableCell>{game.multiplier}x</TableCell><TableCell>₹{game.win_amount.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="parity" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Parity Rounds</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Number</TableHead><TableHead className="text-white">Parity</TableHead><TableHead className="text-white">Range</TableHead></TableRow></TableHeader><TableBody>{parityGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.result_number}</TableCell><TableCell><Badge>{game.result_parity}</Badge></TableCell><TableCell><Badge>{game.result_range}</Badge></TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="diceroll" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Dice Rolls</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">Game #</TableHead><TableHead className="text-white">Dice</TableHead><TableHead className="text-white">Sum</TableHead></TableRow></TableHeader><TableBody>{diceGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.game_number}</TableCell><TableCell>{game.dice1_result} + {game.dice2_result}</TableCell><TableCell>{game.total_sum}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="spintowin" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Spins</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead className="text-white">User</TableHead><TableHead className="text-white">Bet</TableHead><TableHead className="text-white">Result</TableHead><TableHead className="text-white">Win</TableHead></TableRow></TableHeader><TableBody>{spinWinGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.user_id.slice(0,8)}...</TableCell><TableCell>₹{game.bet_amount}</TableCell><TableCell>{game.result_segment}</TableCell><TableCell>₹{game.win_amount}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="chickenroad" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Chicken Road Games</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead>User</TableHead><TableHead>Bet</TableHead><TableHead>Distance</TableHead><TableHead>Eggs</TableHead><TableHead>Win</TableHead></TableRow></TableHeader><TableBody>{chickenRoadGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.user_id.slice(0,8)}...</TableCell><TableCell>₹{game.bet_amount}</TableCell><TableCell>{game.distance_covered}m</TableCell><TableCell>{game.eggs_collected}</TableCell><TableCell>₹{game.win_amount}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                    <TabsContent value="penalty" className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Recent Penalty Shootouts</h3>
                        <Table><TableHeader><TableRow className="border-slate-600"><TableHead>User</TableHead><TableHead>Bet</TableHead><TableHead>Goals</TableHead><TableHead>Win</TableHead></TableRow></TableHeader><TableBody>{penaltyGames.map(game => (<TableRow key={game.id} className="border-slate-600"><TableCell>{game.user_id.slice(0,8)}...</TableCell><TableCell>₹{game.bet_amount}</TableCell><TableCell>{game.goals_scored}/5</TableCell><TableCell>₹{game.win_amount.toFixed(2)}</TableCell></TableRow>))}</TableBody></Table>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}