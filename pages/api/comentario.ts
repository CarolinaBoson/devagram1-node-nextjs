import type {NextApiRequest, NextApiResponse} from 'next';
import type { RespostaPadraoMsg } from '../../types/RespostaPadraoMsg';
import { validarTokenJWT } from '@/middlewares/validarTokenJWT';
import { conectarMongoDB } from '@/middlewares/conectarMongoDB';
import { UsuarioModel } from '@/models/UsuarioModel';
import { PublicacaoModel } from '@/models/PublicacaoModel';
import { politicaCORS } from '@/middlewares/politicaCORS';

const comentarioEndpoint = async (req: NextApiRequest, res : NextApiResponse<RespostaPadraoMsg>) => {
    try{
        // qual metodo http vamos utilizar? r: PUT, pq é uma atualização 
        if(req.method === 'PUT'){
        // quais dados são necessarios para realizar a operação? r: id do usuario que vai comentar(vem do query), 
        // id da publicação (vem do query), comentario (vem do body)
        
        const {userId, id} = req.query;
        const usuarioLogado = await UsuarioModel.findById(userId);
        if(!usuarioLogado){
            return res.status(400).json({erro: 'Usuario não encontrado'});
        }

        const publicacao = await PublicacaoModel.findById(id);
        if(!publicacao){
            return res.status(400).json({erro: 'Publicação não encontrada'});
        }

        if(!req.body || !req.body.comentario || req.body.comentario.length < 2){
            return res.status(400).json({erro: 'Comentario não é valido'});
        }
        
        const comentario = {
            usuarioId : usuarioLogado._id,
            nome : usuarioLogado.nome,
            comentario : req.body.comentario 
        }

        publicacao.comentarios.push(comentario);
        await PublicacaoModel.findByIdAndUpdate({_id : publicacao._id}, publicacao);
            return res.status(200).json({msg : 'Comentario adicionado com sucesso'});

        }
        

        return res.status(405).json({erro: 'Método informado não é valido'});

    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Ocorreu erro ao adicionar comentario'});
    }
}

export default politicaCORS(validarTokenJWT(conectarMongoDB(comentarioEndpoint)));