// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

contract PokeCatcher {
  //Variables
  struct Owner{
    address owner;
    bool owned;
  }
  mapping(string => Owner) ownership;

  //Constructor
  constructor() public {}

  //Metodos

  /* function <nombre> (<parametros>) <acceso> <visibilidad> <tipo retorno>*/

  ///Capturar
  function capture(string memory pokemonName) public returns (string memory){
    require(!ownership[pokemonName].owned, "Este Pokemon ya ha sido capturado");
    
    ownership[pokemonName].owner = msg.sender;
    ownership[pokemonName].owned = true;

  return pokemonName;
  }
  ///Verificar si ha sido capturado
  function isOwned(string memory pokemonName) public view returns(bool){
    return ownership[pokemonName].owned;
  }

  ///Obtener al dueño
  function getOwned(string memory pokemonName) public view returns(address){
    return ownership[pokemonName].owner;
  }
}
