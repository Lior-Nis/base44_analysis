import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, LogIn, Phone, Mail, Loader2, AlertCircle } from 'lucide-react';
import { User as UserEntity } from '@/api/entities';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';

export default function EntrarPage() {
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');

    const handlePhoneSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSearchResult(null);

        try {
            // Limpar e formatar número de telefone
            const cleanedPhone = phone.replace(/\D/g, '');
            const users = await UserEntity.filter({ phone: cleanedPhone });

            if (users.length > 0) {
                // Ofuscar email para privacidade
                const user = users[0];
                const [emailUser, emailDomain] = user.email.split('@');
                const maskedUser = emailUser.length > 2 ? `${emailUser.substring(0, 2)}...` : `${emailUser.substring(0, 1)}...`;
                setSearchResult({ ...user, maskedEmail: `${maskedUser}@${emailDomain}` });
            } else {
                setError('Nenhum cadastro encontrado com este número. Por favor, cadastre-se primeiro.');
            }
        } catch (err) {
            setError('Ocorreu um erro ao buscar seu cadastro. Tente novamente.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await UserEntity.login();
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <img src="https://i.ibb.co/Lrwj5s1/logo-doce-encanto.png" alt="Logo Doce Encanto" className="w-24 mx-auto mb-4" />
                        <CardTitle className="text-2xl font-bold">Bem-vindo(a) de volta!</CardTitle>
                        <CardDescription>Acesse sua conta para fazer pedidos e ver suas recompensas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Login com Telefone */}
                        <form onSubmit={handlePhoneSearch} className="space-y-4">
                            <div>
                                <label htmlFor="phone" className="font-semibold text-gray-700">Entrar com Telefone</label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="Seu número de WhatsApp"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="flex-grow"
                                        required
                                    />
                                    <Button type="submit" disabled={isLoading} variant="outline">
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <AnimatePresence>
                            {error && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Erro</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            {searchResult && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <Alert variant="default" className="bg-green-50 border-green-200">
                                        <Mail className="h-4 w-4 text-green-700" />
                                        <AlertTitle className="text-green-800">Cadastro Encontrado!</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            Encontramos seu cadastro associado ao email: <br />
                                            <strong className="font-bold">{searchResult.maskedEmail}</strong>.
                                            <br />
                                            Clique no botão "Entrar com Google" abaixo para acessar.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Ou</span>
                            </div>
                        </div>

                        {/* Botão de Login/Cadastro com Google */}
                        <div className="space-y-2">
                             <Button onClick={handleGoogleLogin} className="w-full bg-orange-500 hover:bg-orange-600 text-lg py-6">
                                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-5 w-5"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"></path><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path></svg>
                                Entrar ou Cadastrar com Google
                            </Button>
                            <p className="text-xs text-center text-gray-500">
                                Não tem email? Use o Google para criar uma conta segura em 1 minuto.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}