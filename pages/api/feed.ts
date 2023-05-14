import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import { cache } from 'react';
import { UsuarioModel } from '@/models/UsuarioModel';
import usuario from './usuario';
import { PublicacaoModel } from '@/models/PublicacaoModel';
import { SeguidorModel } from '@/models/SeguidorModel';

const feedEndpoint = async(req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg> | any) => {
    try{
        if(req.method === 'GET'){
            // Receber uma informação do id do usuario que eu quero buscar no feed. De onde vem essa informação?
            if(req?.query?.id){
            // Agora que tenho o id do usuario
            // como valido se é um usuario,
            const usuario = await UsuarioModel.findById(req?.query?.id);
            if(!usuario){
                return res.status(400).json({erro: 'Usuario não encontrado'});
            }

            // e como busco as publicações dele?
            const publicacoes = await PublicacaoModel.find({idUsuario: usuario._id}).sort({data: -1});

            return res.status(200).json(publicacoes);
            }else{
                // agora que já estamos no feed principal, qual o proximo passo?

                const {userId} = req.query;
                const usuarioLogado = await UsuarioModel.findById(userId);
                if(!usuarioLogado){
                    return res.status(400).json({erro: 'Usuario não encontado'});
                }
                
                //agora que tenho o usuario, qual o proximo passo?

                const seguidores = await SeguidorModel.find({usuarioId: usuarioLogado._id});
                const seguidoresIds = seguidores.map(s => s.usuarioSeguidoId);

                const publicacoes = await PublicacaoModel.find({
                    $or : [
                        {idUsuario: usuarioLogado._id},
                        {idUsuario : seguidoresIds}
                    ]
                })
                .sort({data : -1});

                //concatenação de dados
                const result = [];
                for (const publicacao of publicacoes) {
                    const usuariodaPublicacao = await  UsuarioModel.findById(publicacao.idUsuario);
                    if(usuariodaPublicacao){
                        const final = {...publicacao._doc, usuario : {
                            nome : usuariodaPublicacao.nome,
                            avatar : usuariodaPublicacao.avatar
                        }};
                        result.push(final);
                    }
                }

                return res.status(200).json(result);
            }
        }
        return res.status(405).json({erro: 'Método informado não é valido'});
    }catch(e){
        console.log(e);
        
    }
    return res.status(400).json({erro: 'Não foi possivel obter o feed'});
}

export default validarTokenJWT(conectarMongoDB(feedEndpoint));