import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import {validarTokenJWT} from '../../middlewares/validarTokenJWT';
import {conectarMongoDB} from '../../middlewares/conectarMongoDB';
import { cache } from 'react';
import { UsuarioModel } from '@/models/UsuarioModel';
import usuario from './usuario';
import { PublicacaoModel } from '@/models/PublicacaoModel';

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

            }
        }
        return res.status(405).json({erro: 'Método informado não é valido'});
    }catch(e){
        console.log(e);
        
    }
    return res.status(400).json({erro: 'Não foi possivel obter o feed'});
}

export default validarTokenJWT(conectarMongoDB(feedEndpoint));