import type { NextApiRequest, NextApiResponse } from "next";
import type { RespostaPadraoMsg } from "../../types/RespostaPadraoMsg";
import { validarTokenJWT } from "@/middlewares/validarTokenJWT";
import { conectarMongoDB } from "@/middlewares/conectarMongoDB";
import { UsuarioModel } from "@/models/UsuarioModel";
import { SeguidorModel } from "@/models/SeguidorModel";

const endpointSeguir = async (req: NextApiRequest, res: NextApiResponse) => {
    try{
        if(req.method === 'PUT'){

            const {userId, id} = req?.query;

            //usuario logado/autenticado = quem está fazendo as ações
            const usuarioLogado = await UsuarioModel.findById(userId);
            if(!usuarioLogado){
                return res.status(400).json({erro: 'Usuario logado não encontrado'});
            }

            //id do usuario a ser seguido - query
            const usuarioASerSeguido = await UsuarioModel.findById(id);
            if(!usuarioASerSeguido){
                return res.status(400).json({erro: 'Usuario a ser seguido não encontrado'});
            }

            // verificar se tem ou não registro - buscar se EU LOGADO sigo ou não esse usuario
            const euJaSigoEsseUsuario = await SeguidorModel
            .find({usuarioId: usuarioLogado._id, usuarioSeguidoId : usuarioASerSeguido._id});
            if(euJaSigoEsseUsuario && euJaSigoEsseUsuario.length > 0){
                // sinal que sigo esse usuario - deixar de seguir
                euJaSigoEsseUsuario.forEach(async(e : any) => await SeguidorModel.findByIdAndDelete({_id: e._id}));
                usuarioASerSeguido.seguidores--;
                await UsuarioModel.findByIdAndUpdate({_id: usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg: 'Deixou de seguir o usuario com sucesso'});
            }else{
                // sinal que eu não sigo esse usuario - seguir
                const seguidor = {
                    usuarioId : usuarioLogado._id,
                    usuarioSeguidoId : usuarioASerSeguido._id
                };
                await SeguidorModel.create(seguidor);

                // adicionar um seguindo no usuario logado
                usuarioLogado.seguindo++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioLogado._id}, usuarioLogado);

                // adicionar um seguidor no usuario seguido
                usuarioASerSeguido.seguidores++;
                await UsuarioModel.findByIdAndUpdate({_id : usuarioASerSeguido._id}, usuarioASerSeguido);

                return res.status(200).json({msg: 'Usuario seguido com sucesso'});
            }
        }

        return res.status(405).json({erro: 'Método informado não é valido'});
    }catch(e){
        console.log(e);
        return res.status(500).json({erro: 'Não foi possivel seguir/deseguir o usuario informado'});
    }
}


export default validarTokenJWT(conectarMongoDB(endpointSeguir));