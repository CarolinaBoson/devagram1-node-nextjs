import type {NextApiRequest, NextApiResponse} from 'next';
import type {RespostaPadraoMsg} from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '@/middlewares/validarTokenJWT';
import { conectarMongoDB } from '@/middlewares/conectarMongoDB';
import { PublicacaoModel } from '@/models/PublicacaoModel';
import { UsuarioModel } from '@/models/UsuarioModel';
import { politicaCORS } from '@/middlewares/politicaCORS';

const likeEndpoint = async (req: NextApiRequest, res: NextApiResponse<RespostaPadraoMsg>) => {

    try{
        if(req.method === 'PUT'){

            // 1º - É preciso id da publicação
            const {id} = req?.query;
            const publicacao = await PublicacaoModel.findById(id);
            if(!publicacao){
                return res.status(400).json({erro: 'Publicação não encontrada'});
            }

                    
            // 2º - Id do usuario que está curtindo 
            const {userId} = req?.query;
            const usuario = await UsuarioModel.findById(userId);
            if(!usuario){
                return res.status(400).json({erro: 'Usuario não encontrado'});
            }

            // Como administrar os likes?
            const indexDoUsuarioNoLike =publicacao.likes.findIndex((e : any) => e.toString() === usuario._id.toString());

            // se o index for > -1 sinal que ele já curte a foto
            if(indexDoUsuarioNoLike != -1){
                publicacao.likes.splice(indexDoUsuarioNoLike, 1);
            // atualizar publicação p/ deslike
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao); 
                return res.status(200).json({msg : 'Publicação descurtida com sucesso'}); 
            }else{
            // se o index for -1 sinal que ele não curte a foto
                publicacao.likes.push(usuario._id);
            // atualizar publicação p/ like
                await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
                return res.status(200).json({msg : 'Publicação curtida com sucesso'});    
            }
        }

        return res.status(405).json({erro: 'Método informado não é valido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu erro ao curtir/descurtir uma publicação'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(likeEndpoint)));