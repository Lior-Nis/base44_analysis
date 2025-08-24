import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Testemunho } from '@/api/entities';

function Rating({ value, setValue, readOnly = false }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    className={`cursor-pointer ${value >= i ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    onClick={() => !readOnly && setValue(i)}
                />
            ))}
        </div>
    );
}

export default function Testemunhos() {
    const [testimonies, setTestimonies] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        async function loadTestimonies() {
            const data = await Testemunho.filter({ is_approved: true });
            setTestimonies(data);
        }
        loadTestimonies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await Testemunho.create({ customer_name: name, rating, comment });
            alert('Depoimento enviado com sucesso! Ele será exibido após aprovação.');
            setName('');
            setEmail('');
            setRating(0);
            setComment('');
        } catch (error) {
            alert('Ocorreu um erro ao enviar seu depoimento.');
        }
    };

    return (
        <div className="container mx-auto py-12 px-4 md:px-0">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">O Que Nossos Clientes Dizem</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Veja os depoimentos de quem já experimentou nossos deliciosos pastéis.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-16">
                {testimonies.map(testimony => (
                    <Card key={testimony.id}>
                        <CardContent className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4" />
                                <div>
                                    <h4 className="font-bold">{testimony.customer_name}</h4>
                                    <Rating value={testimony.rating} readOnly />
                                </div>
                            </div>
                            <p className="text-gray-600">"{testimony.comment}"</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="max-w-2xl mx-auto">
                <h3 className="text-2xl font-bold text-center mb-8">Deixe seu Depoimento</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} required />
                        <Input type="email" placeholder="Seu email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Avaliação</label>
                        <Rating value={rating} setValue={setRating} />
                    </div>
                    <Textarea placeholder="Conte sua experiência com nossos pastéis" value={comment} onChange={e => setComment(e.target.value)} required rows={5}/>
                    <Button type="submit" className="w-full">Enviar Depoimento</Button>
                </form>
            </div>
        </div>
    );
}